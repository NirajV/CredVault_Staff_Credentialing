export const createAlertRuleModel = (sequelize, DataTypes) => {
  return sequelize.define('AlertRule', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    credentialType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'all',
      field: 'credential_type'
    },
    thresholds: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[7,30,60,90]',
      get() {
        const raw = this.getDataValue('thresholds');
        try { return JSON.parse(raw); } catch { return [7, 30, 60, 90]; }
      },
      set(val) {
        this.setDataValue('thresholds', JSON.stringify(Array.isArray(val) ? val : [7, 30, 60, 90]));
      }
    },
    notifyEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'notify_email'
    },
    notifyRole: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'notify_role'
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    tableName: 'alert_rules',
    timestamps: false,
    underscored: true
  });
};
