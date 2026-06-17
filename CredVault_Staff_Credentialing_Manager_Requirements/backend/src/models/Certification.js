export const createCertificationModel = (sequelize, DataTypes) => {
  return sequelize.define('Certification', {
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
    certName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'cert_name'
    },
    certifyingBody: {
      type: DataTypes.STRING(150),
      field: 'certifying_body'
    },
    certificateNumber: {
      type: DataTypes.STRING(100),
      field: 'certificate_number'
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
      type: DataTypes.ENUM('active', 'expired', 'revoked'),
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
    tableName: 'certifications',
    timestamps: false,
    underscored: true
  });
};
