export const createTaskModel = (sequelize, DataTypes) => {
  return sequelize.define('Task', {
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
    assignedTo: {
      type: DataTypes.STRING(100),
      field: 'assigned_to'
    },
    taskType: {
      type: DataTypes.ENUM('credential_renewal', 'document_upload', 'verification', 'approval', 'follow_up'),
      field: 'task_type'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      field: 'due_date'
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'pending'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium'
    },
    completedAt: {
      type: DataTypes.DATE,
      field: 'completed_at'
    },
    notes: {
      type: DataTypes.TEXT
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
    tableName: 'tasks',
    timestamps: false,
    underscored: true
  });
};
