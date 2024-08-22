import UnAuthenticated from '../../custom-errors/unauthenticated';

export const isResourceOwner = async (
	loggedInUserId: string | undefined,
	requesterId: string
): Promise<Boolean> => {
	const userIsResourceOwner = loggedInUserId === requesterId;
	if (!userIsResourceOwner) {
		throw new UnAuthenticated(`you are not the owner of the resource`);
	}
	return true;
};
