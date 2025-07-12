const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Chatroom = sequelize.define('Chatroom', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    timestamps: true,
    tableName: 'chatrooms',
  });

  return Chatroom;
}; 