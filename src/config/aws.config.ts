export const awsConfig = {
  region: process.env.AWS_REGION || 'me-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  s3: {
    bucket: process.env.AWS_S3_BUCKET || 'hisab-files',
  },
  rds: {
    backupRetentionPeriod: 7,
    preferredBackupWindow: '03:00-04:00',
    preferredMaintenanceWindow: 'sun:04:00-sun:05:00',
  },
};
