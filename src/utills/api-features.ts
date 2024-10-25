import { QueryWithHelpers } from 'mongoose';

class ApiFeatures<T> {
	public queryString;
	public mongooseQuery;
	constructor(
		mongooseQuery: QueryWithHelpers<T[], T>,
		queryString?: Record<string, string>
	) {
		this.mongooseQuery = mongooseQuery;
		this.queryString = queryString;
	}

	paginate(): this {
		const page = Number(this.queryString?.page) || 1;
		const limit = Number(this.queryString?.limit) || 10;
		const skip = (page - 1) * limit;

		this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

		return this;
	}

	filter(): this {
		let filterObj = { ...this.queryString };
		let excludedQuery = ['page', 'sort', 'search', 'fields', 'limit'];
		excludedQuery.forEach((a) => {
			delete filterObj[a];
		});

		let filterStr = JSON.stringify(filterObj);
		filterStr = filterStr.replace(
			/\b(gte|gt|lte|lt)\b/g,
			(match) => `$${match}`
		);

		this.mongooseQuery = this.mongooseQuery.where(JSON.parse(filterStr));
		return this;
	}

	sort(): this {
		if (this.queryString && this.queryString.sort) {
			const sortBy = this.queryString?.sort.split(',').join(' ');
			this.mongooseQuery = this.mongooseQuery.sort(sortBy);
		} else {
			this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
		}

		return this;
	}

	search(searchableFields: string[]): this {
		if (this.queryString && this.queryString.search) {
			const searchValue = this.queryString.search;
			const searchQuery: Record<string, unknown> = {
				$or: searchableFields.map((field) => ({
					[field]: { $regex: new RegExp(`^${searchValue}$`, 'i') },
				})),
			};

			this.mongooseQuery = this.mongooseQuery.where(searchQuery);
		}

		return this;
	}

	includeFields(fieldsToReturn: string[]): this {
		if (this.queryString && this.queryString.fields) {
			const fields = this.queryString.fields.split(',');
			this.mongooseQuery = this.mongooseQuery.select(fields);
		} else if (fieldsToReturn) {
			this.mongooseQuery = this.mongooseQuery.select(fieldsToReturn);
		}

		return this;
	}
}

export default ApiFeatures;
