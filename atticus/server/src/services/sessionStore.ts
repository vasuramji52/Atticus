// server/src/services/sessionStore.ts
export interface SessionData {
  lastTaskType: string;
  lastDate?: string;
  lastTime?: string;
}

const sessionMap = new Map<string, SessionData>();

export function getSession(callSid: string) {
  return sessionMap.get(callSid);
}

export function setSession(callSid: string, data: SessionData) {
  sessionMap.set(callSid, data);
}

export function clearSession(callSid: string) {
  sessionMap.delete(callSid);
}
