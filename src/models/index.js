const sequelize = require('../config/database');
const UserModel = require('./User');
const ChatroomModel = require('./Chatroom');
const MessageModel = require('./Message');
const SubscriptionModel = require('./Subscription');

const db = {};
db.sequelize = sequelize;
db.User = UserModel(sequelize);
db.Chatroom = ChatroomModel(sequelize);
db.Message = MessageModel(sequelize);
db.Subscription = SubscriptionModel(sequelize);

// Associations
// User - Chatroom
// User hasMany Chatroom, Chatroom belongsTo User
// Chatroom hasMany Message, Message belongsTo Chatroom
// User hasMany Message, Message belongsTo User
db.User.hasMany(db.Chatroom, { foreignKey: 'userId' });
db.Chatroom.belongsTo(db.User, { foreignKey: 'userId' });
db.Chatroom.hasMany(db.Message, { foreignKey: 'chatroomId' });
db.Message.belongsTo(db.Chatroom, { foreignKey: 'chatroomId' });
db.User.hasMany(db.Message, { foreignKey: 'userId' });
db.Message.belongsTo(db.User, { foreignKey: 'userId' });
// User - Subscription
// User hasOne Subscription, Subscription belongsTo User
db.User.hasOne(db.Subscription, { foreignKey: 'userId' });
db.Subscription.belongsTo(db.User, { foreignKey: 'userId' });

module.exports = db; 