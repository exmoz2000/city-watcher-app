import {
  ReportCategory,
  ReportStatus,
} from '../src/types';
import {
  mockReports,
  mockAlerts,
  mockUser,
  statusDisplayMap,
  categoryDisplayMap,
} from '../src/constants/mockData';

describe('Mock Reports', () => {
  it('should have at least one report', () => {
    expect(mockReports.length).toBeGreaterThan(0);
  });

  it('every report should have valid required fields', () => {
    mockReports.forEach((report) => {
      expect(report.id).toBeTruthy();
      expect(report.caseId).toBeTruthy();
      expect(report.category).toBeTruthy();
      expect(report.status).toBeTruthy();
      expect(report.location).toBeDefined();
      expect(typeof report.location.latitude).toBe('number');
      expect(typeof report.location.longitude).toBe('number');
    });
  });

  it('every report caseId should match expected format', () => {
    mockReports.forEach((report) => {
      expect(report.caseId).toMatch(/^CW-\d{4}-\d+$/);
    });
  });

  it('every report should have a valid ReportCategory', () => {
    const validCategories = Object.values(ReportCategory);
    mockReports.forEach((report) => {
      expect(validCategories).toContain(report.category);
    });
  });

  it('every report should have a valid ReportStatus', () => {
    const validStatuses = Object.values(ReportStatus);
    mockReports.forEach((report) => {
      expect(validStatuses).toContain(report.status);
    });
  });
});

describe('Mock Alerts', () => {
  it('should have at least one alert', () => {
    expect(mockAlerts.length).toBeGreaterThan(0);
  });

  it('every alert should have valid required fields', () => {
    mockAlerts.forEach((alert) => {
      expect(alert.id).toBeTruthy();
      expect(alert.title).toBeTruthy();
      expect(alert.message).toBeTruthy();
      expect(alert.category).toBeTruthy();
      expect(alert.severity).toBeTruthy();
      expect(alert.geofence).toBeDefined();
      expect(alert.createdAt).toBeInstanceOf(Date);
      expect(alert.expiresAt).toBeInstanceOf(Date);
      expect(typeof alert.isActive).toBe('boolean');
      expect(typeof alert.recipientCount).toBe('number');
    });
  });
});

describe('statusDisplayMap', () => {
  it('should cover all ReportStatus values', () => {
    const allStatuses = Object.values(ReportStatus);
    allStatuses.forEach((status) => {
      expect(statusDisplayMap[status]).toBeDefined();
      expect(statusDisplayMap[status].label).toBeTruthy();
      expect(statusDisplayMap[status].color).toBeTruthy();
    });
  });
});

describe('categoryDisplayMap', () => {
  it('should cover all ReportCategory values', () => {
    const allCategories = Object.values(ReportCategory);
    allCategories.forEach((category) => {
      expect(categoryDisplayMap[category]).toBeDefined();
      expect(categoryDisplayMap[category].label).toBeTruthy();
      expect(categoryDisplayMap[category].icon).toBeTruthy();
      expect(categoryDisplayMap[category].department).toBeTruthy();
    });
  });
});

describe('Mock User', () => {
  it('should have a valid profile', () => {
    expect(mockUser.id).toBeTruthy();
    expect(mockUser.email).toBeTruthy();
    expect(mockUser.profile).toBeDefined();
    expect(mockUser.profile.firstName).toBeTruthy();
    expect(mockUser.profile.lastName).toBeTruthy();
    expect(Array.isArray(mockUser.profile.emergencyContacts)).toBe(true);
  });

  it('should have valid preferences', () => {
    expect(mockUser.preferences).toBeDefined();
    expect(mockUser.preferences.language).toBeTruthy();
    expect(typeof mockUser.preferences.notificationsEnabled).toBe('boolean');
    expect(Array.isArray(mockUser.preferences.alertCategories)).toBe(true);
    expect(typeof mockUser.preferences.locationSharingEnabled).toBe('boolean');
  });
});
