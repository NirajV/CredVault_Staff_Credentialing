export const createMalpracticeModel = (sequelize, DataTypes) => {
  return sequelize.define('Malpractice', {
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
    carrier: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    policyNumber: {
      type: DataTypes.STRING(100),
      field: 'policy_number'
    },
    policyType: {
      type: DataTypes.ENUM('occurrence', 'claims_made'),
      defaultValue: 'claims_made',
      field: 'policy_type'
    },
    coveragePerClaim: {
      type: DataTypes.DECIMAL(12, 2),
      field: 'coverage_per_claim'
    },
    aggregateLimit: {
      type: DataTypes.DECIMAL(12, 2),
      field: 'aggregate_limit'
    },
    effectiveDate: {
      type: DataTypes.DATEONLY,
      field: 'effective_date'
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      field: 'expiry_date'
    },
    tailCoverage: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'tail_coverage'
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'lapsed'),
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
    tableName: 'malpractice_insurance',
    timestamps: false,
    underscored: true
  });
};
