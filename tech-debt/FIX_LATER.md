# MCBP-MIS — Deferred Error Fixes

Status: PENDING
Priority: Fix before final deployment

## Known Issues
- React useEffect / setState errors
- Missing JSX key props
- React render purity / Date.now errors
- Old window.location.assign navigation warnings

## Rules for Future Fix
1. Preserve all existing modules and functionality.
2. Preserve localStorage data and state.
3. Preserve unified Main Dashboard layout.
4. Take backups before modifying files.
5. Fix errors without disabling ESLint rules.

## Final Validation
npx tsc --noEmit
npx eslint .
npm run build

## Full Error Log
See: tech-debt/eslint-errors.txt
