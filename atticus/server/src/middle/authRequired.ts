import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import fetch from "node-fetch";

// If you're on Node 18+, `fetch` is built in.
// If you're on older Node, you'll need: import fetch from "node-fetch";

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;        // Cognito user ID (the "subject")
        email?: string;     // may or may not exist depending on token type
        [key: string]: any; // extra claims if you want them
      };
    }
  }
}

// --- UPDATE THESE TO MATCH YOUR COGNITO SETUP ---
const region = "us-east-2";
const userPoolId = "us-east-2_96wClzCbY";

// Cognito exposes its signing keys here:
const jwksUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;

// We'll cache the public keys (PEMs) so we don't fetch them on every request
let pemsCache: Record<string, string> | null = null;

// Load & cache Cognito JWKs, convert to PEMs
async function getPems() {
  if (pemsCache) return pemsCache;

  const res = await fetch(jwksUrl);
  const json = await res.json() as { keys: Array<{ kid: string, [key: string]: any }> };
  const { keys } = json;

  const pems: Record<string, string> = {};
  for (const key of keys) {
    // jwk-to-pem turns each JWK into a PEM public key string
    const pem = jwkToPem(key);
    pems[key.kid] = pem; // kid = key id
  }

  pemsCache = pems;

  return pems;
}

// Middleware
export async function authRequired(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Read Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "missing_or_bad_token" });
    }

    // 2. Isolate the actual token string
    const token = authHeader.split(" ")[1];

    // 3. Decode the header of the JWT to see which key signed it
    const decodedHeader = jwt.decode(token, { complete: true });

    // jwt.decode can return string | object | null
    if (!decodedHeader || typeof decodedHeader === "string" || !decodedHeader.header?.kid) {
      return res.status(401).json({ error: "invalid_token_header" });
    }

    // 4. Get the signing key that matches this token
    const pems = await getPems();
    const kid = decodedHeader.header.kid;
    
    if (!(kid in pems)) {
      return res.status(401).json({ error: "unrecognized_signing_key" });
    }
    
    const pem = pems[kid];

    // 5. Verify token signature and claims
    const decoded = await new Promise<jwt.JwtPayload | null>((resolve) => {
      jwt.verify(token, pem, { algorithms: ["RS256"] }, (err, decoded) => {
        if (err || !decoded || typeof decoded === "string") {
          resolve(null);
        } else {
          resolve(decoded as jwt.JwtPayload);
        }
      });
    });

    if (!decoded) {
      return res.status(401).json({ error: "token_verification_failed" });
    }

    // 6. Attach user info to req.user for downstream routes
    req.user = {
      sub: decoded.sub as string,
      email: decoded.email as string | undefined,
      ...decoded
    };

    // 7. Move on to the actual route logic
    next();
  } catch (err) {
    console.error("--- DEBUG START ---");
    console.error("authRequired error:", err);
    console.error("--- DEBUG END ---");
    return res.status(401).json({ error: "auth_middleware_error" });
  }
}