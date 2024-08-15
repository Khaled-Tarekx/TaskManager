export const isResourceOwner = async (
	loggedInUserId: string,
	requesterId: string
): Promise<Boolean> => {
	return loggedInUserId === requesterId;
};
