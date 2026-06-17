export const createLicenseModel = (sequelize, DataTypes) => {
  return sequelize.define('License', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    providerId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'provider_id'
    },
    state: {
      type: DataTypes.STRING(2),
      allowNull: false
    },
    licenseNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'license_number'
    },
    licenseType: {
      type: DataTypes.STRING(50),
      field: 'license_type'
    },
    issueDate: {
      type: DataTypes.DATEONLY,
      field: 'issue_date'
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      field: 'expiry_date'
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'suspended', 'revoked'),
      defaultValue: 'active'
    },
    psvStatus: {
      type: DataTypes.ENUM('pending', 'verified', 'failed', 'manual_required'),
      defaultValue: 'pending',
      field: 'psv_status'
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
    tableName: 'licenses',
    timestamps: false,
    underscored: true
  });
};
