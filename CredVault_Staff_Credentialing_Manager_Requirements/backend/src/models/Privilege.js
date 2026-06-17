export const createPrivilegeModel = (sequelize, DataTypes) => {
  return sequelize.define('Privilege', {
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
    facilityId: {
      type: DataTypes.UUID,
      field: 'facility_id'
    },
    privilegeType: {
      type: DataTypes.STRING(100),
      field: 'privilege_type'
    },
    procedures: {
      type: DataTypes.TEXT
    },
    grantedDate: {
      type: DataTypes.DATEONLY,
      field: 'granted_date'
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      field: 'expiry_date'
    },
    approvalStatus: {
      type: DataTypes.ENUM('pending', 'approved', 'denied', 'suspended', 'revoked'),
      defaultValue: 'pending',
      field: 'approval_status'
    },
    approvalDate: {
      type: DataTypes.DATE,
      field: 'approval_date'
    },
    restrictions: {
      type: DataTypes.TEXT
    },
    scopeOfPractice: {
      type: DataTypes.TEXT,
      field: 'scope_of_practice'
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
    tableName: 'privileges',
    timestamps: false,
    underscored: true
  });
};
