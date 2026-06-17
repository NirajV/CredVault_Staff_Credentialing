export const createProviderModel = (sequelize, DataTypes) => {
  return sequelize.define('Provider', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    npi: {
      type: DataTypes.STRING(10),
      unique: true,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'last_name'
    },
    specialty: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    subSpecialty: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'sub_specialty'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: { isEmail: true }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'date_of_birth'
    },
    employmentType: {
      type: DataTypes.ENUM('full_time', 'part_time', 'contractor', 'locum'),
      defaultValue: 'full_time',
      field: 'employment_type'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'terminated'),
      defaultValue: 'active'
    },
    statusDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'status_date'
    },
    hireDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'hire_date'
    },
    terminationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'termination_date'
    },
    complianceScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'compliance_score'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
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
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at'
    }
  }, {
    tableName: 'providers',
    timestamps: false,
    underscored: true
  });
};
