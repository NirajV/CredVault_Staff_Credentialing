export const createDEAModel = (sequelize, DataTypes) => {
  return sequelize.define('DEA', {
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
    deaNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'dea_number'
    },
    state: {
      type: DataTypes.STRING(2)
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
      type: DataTypes.ENUM('active', 'expired', 'revoked', 'suspended'),
      defaultValue: 'active'
    },
    schedulesAuthorized: {
      type: DataTypes.STRING(50),
      field: 'schedules_authorized'
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
    tableName: 'dea_registrations',
    timestamps: false,
    underscored: true
  });
};
