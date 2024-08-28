class MemberCreationFailed extends Error {
	constructor() {
		super('member creation failed');
		this.name = 'MemberCreationFailed';
	}
}

export { MemberCreationFailed };
