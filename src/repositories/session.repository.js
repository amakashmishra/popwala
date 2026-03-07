const Session = require("../models/session.model");

const create = (payload) => Session.create(payload);

const findActiveByHash = (refreshTokenHash) =>
  Session.findOne({ refreshTokenHash, isRevoked: false }).populate("user");

const revokeByHash = (refreshTokenHash) =>
  Session.findOneAndUpdate(
    { refreshTokenHash, isRevoked: false },
    { isRevoked: true, revokedAt: new Date() },
    { new: true }
  );

const revokeAllByUser = (userId) =>
  Session.updateMany({ user: userId, isRevoked: false }, { isRevoked: true, revokedAt: new Date() });

module.exports = {
  create,
  findActiveByHash,
  revokeByHash,
  revokeAllByUser,
};
