import { Query } from "mongoose";
import { excludeField } from "../constants";

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public readonly query: Record<string, string>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  filter(): this {
    const filter: Record<string, unknown> = { ...this.query };

    // Handle date range filtering with startDate and endDate
    if (filter.startDate || filter.endDate) {
      const dateFilter: { $gte?: Date; $lte?: Date } = {};

      if (filter.startDate) {
        const startDate = new Date(filter.startDate as string);
        startDate.setHours(0, 0, 0, 0); // Set to beginning of day
        dateFilter.$gte = startDate;
      }

      if (filter.endDate) {
        const endDate = new Date(filter.endDate as string);
        endDate.setHours(23, 59, 59, 999); // Set to end of day
        dateFilter.$lte = endDate;
      }

      filter.createdAt = dateFilter;
      delete filter.startDate;
      delete filter.endDate;
    }

    for (const field of excludeField) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete filter[field];
    }

    this.modelQuery = this.modelQuery.find(filter); // Tour.find().find(filter)

    return this;
  }

  search(searchableField: string[]): this {
    const searchTerm = this.query.searchTerm || "";
    const searchQuery = {
      $or: searchableField.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
      })),
    };
    this.modelQuery = this.modelQuery.find(searchQuery);
    return this;
  }

  sort(): this {
    const sort = this.query.sort || "-createdAt";

    this.modelQuery = this.modelQuery.sort(sort);

    return this;
  }
  fields(): this {
    const fields = this.query.fields?.split(",").join(" ") || "";

    this.modelQuery = this.modelQuery.select(fields);

    return this;
  }
  paginate(): this {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  build() {
    return this.modelQuery;
  }

  async getMeta() {
    const filterQuery = { ...this.modelQuery.getFilter() };
    const totalDocuments = await this.modelQuery.model.countDocuments(
      filterQuery
    );

    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const totalPage = Math.ceil(totalDocuments / limit);

    return { page, limit, total: totalDocuments, totalPage };
  }
}
