import { BugTask } from './types';

export function validateBugFix(task: BugTask, submittedCode: string): boolean {
  // Remove whitespace and normalize
  const normalized = submittedCode.replace(/\s+/g, ' ').trim();
  const solution = task.solution.replace(/\s+/g, ' ').trim();
  
  // Check if the solution is present in the submitted code
  return normalized.includes(solution);
}

export function isSabotageAttempt(
  originalCode: string,
  submittedCode: string,
  task: BugTask
): boolean {
  // If the code was changed but doesn't contain the solution, it's likely sabotage
  const codeChanged = originalCode !== submittedCode;
  const hasSolution = validateBugFix(task, submittedCode);
  
  return codeChanged && !hasSolution;
}

export function calculateScore(
  role: 'fixer' | 'saboteur',
  success: boolean,
  caught: boolean = false
): number {
  if (role === 'fixer') {
    return success ? 100 : -20;
  } else {
    if (caught) return -50;
    return success ? 150 : 0;
  }
}
