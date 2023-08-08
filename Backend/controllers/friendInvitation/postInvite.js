const User = require("../../models/user");
const FriendInvitation = require("../../models/friendInvitation");
const friendsUpdates = require("../../socketHandlers/updates/friends");

const postInvite = async (req, res) => {
	const { targetMailAddress } = req.body;
	const { userId, mail } = req.user;

	// check if friend that we would like to invite is not user
	if (mail.toLowerCase() === targetMailAddress.toLowerCase()) {
		return res.status(409).send("Sorry. You can't send invitation to yourself");
	}

	const targetUser = await User.findOne({
		mail: targetMailAddress.toLowerCase(),
	});
	if (!targetUser) {
		return res
			.status(404)
			.send(
				`Friend of ${targetMailAddress} has not been found. Please check the mail address.`
			);
	}

	// check if invitations has already been sent
	const invitationAlreadyReceived = await FriendInvitation.findOne({
		senderId: userId,
		receiverId: targetUser._id,
	});

	if (invitationAlreadyReceived) {
		return res.status(409).send("Invitation already sent!");
	}

	// check if the user we would like to invite is already or friend
	const usersAlreadyFriends = targetUser.friends.find(
		(friendId) => friendId.toString() === userId.toString()
	);

	if (usersAlreadyFriends) {
		return res
			.status(409)
			.send("Friend already added. Please check friend list.");
	}

	// create new invitation in database
	const newInvitation = await FriendInvitation.create({
		senderId: userId,
		receiverId: targetUser._id,
	});

	// if invitation has been successfully created, update the pending list of target user

	// send pending invitations update to specific user
	friendsUpdates.updateFriendsPendingInvitations(targetUser._id.toString());

	return res.status(201).send("Invitation has been sent successfully!");
};

module.exports = postInvite;