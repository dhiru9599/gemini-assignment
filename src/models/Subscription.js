const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Subscription = sequelize.define('Subscription', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tier: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'basic',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'inactive',
    },
    stripeSubscriptionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    timestamps: true,
    tableName: 'subscriptions',
  });

  return Subscription;
}; 