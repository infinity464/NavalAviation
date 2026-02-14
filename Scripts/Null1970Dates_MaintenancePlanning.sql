-- Set invalid 1970 epoch dates to NULL in MaintenancePlanning
-- Run against your database (e.g. BNISMMSDB2 or your actual DB name).
-- Adjust database name if needed.

-- Optional: see how many rows will be updated
-- SELECT COUNT(*) AS RowsWith1970LastInsp FROM MaintenancePlanning WHERE CAST(LastInspDate AS DATE) = '1970-01-02' OR CAST(LastInspDate AS DATE) = '1970-01-01';
-- SELECT COUNT(*) AS RowsWith1970NestInsp FROM MaintenancePlanning WHERE CAST(NestInspDate AS DATE) = '1970-01-02' OR CAST(NestInspDate AS DATE) = '1970-01-01';

BEGIN TRANSACTION;

-- Null LastInspDate when it is 1970-01-01 or 1970-01-02 (epoch/default)
UPDATE MaintenancePlanning
SET LastInspDate = NULL
WHERE LastInspDate IS NOT NULL
  AND (CAST(LastInspDate AS DATE) = '1970-01-02' OR CAST(LastInspDate AS DATE) = '1970-01-01');

-- Null NestInspDate when it is 1970-01-01 or 1970-01-02 (epoch/default)
UPDATE MaintenancePlanning
SET NestInspDate = NULL
WHERE NestInspDate IS NOT NULL
  AND (CAST(NestInspDate AS DATE) = '1970-01-02' OR CAST(NestInspDate AS DATE) = '1970-01-01');

-- Review changes before committing:
-- SELECT MaintenancePlanningId, LastInspDate, NestInspDate FROM MaintenancePlanning WHERE LastInspDate IS NULL OR NestInspDate IS NULL;

COMMIT TRANSACTION;
-- ROLLBACK TRANSACTION;  -- use instead of COMMIT to undo
