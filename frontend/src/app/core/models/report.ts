export interface ReportResponse {
  reportId: string;
  reporterId: string;
  reporterUsername: string;
  reportedUserId: string;
  reportedUserUsername: string;
  reportedPostId: string;
  reason: string;
  timestamp: string;
  status: ReportStatus;
  type: ReportType;
}

export enum ReportStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED'
}

export enum ReportType {
  USER = 'USER',
  POST = 'POST'
}
