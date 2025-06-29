import { ClientSession, InsertManyOptions, Model } from "mongoose";
import { Order } from "../enums";

type EditDTO = {
  filter?: object;
  update?: object;
  numberField?: string;
  arrayField?: string;
  element?: string;
  mode: "set" | "inc" | "dec" | "push" | "pull" | "inc-push" | "dec-pull";
};

export type GetManyDTO = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: string;
  searchFields?: string[];
  searchMode?: "and" | "or";
  select?: string;
  populate?: string[];
  populateSelect?: string[];
  filter?: object;
  type?: "paged" | "random" | "all";
};

export type GetOneDTO = {
  conditions?: any;
  index?: number | null;
  select?: string;
  populate?: string[];
  populateSelect?: string[];
};

export class Repo {
  getSession = (session?: ClientSession) => {
    return session ? { session } : undefined;
  };

  convertId = (current: any): any => {
    if (!current) return null;

    if (typeof current.toObject === "function")
      current = current.toObject({ getters: false, virtuals: false });

    if (Array.isArray(current)) return current.map(this.convertId);

    if (typeof current === "object") {
      const result = { ...current };

      if (result._id) {
        result.id = String(result._id);
        delete result._id;
      }

      for (const key in result) {
        if (result.hasOwnProperty(key))
          result[key] = this.convertId(result[key]);
      }

      return result;
    }

    return current;
  };

  checkDoc = async (
    Model: Model<any>,
    filter: object,
    session?: ClientSession
  ) => {
    return !!(await Model.exists(filter)
      .session(session ?? null)
      .exec());
  };

  checkDocs = async (
    Model: Model<any>,
    filters: object[],
    session?: ClientSession
  ): Promise<boolean[]> => {
    const docs = await Model.find({ $or: filters })
      .session(session ?? null)
      .select("_id")
      .lean()
      .exec();

    const filtersMatch = (document: any, filter: any): boolean =>
      Object.keys(filter).every(
        (key) => String(document[key]) === String(filter[key])
      );

    return filters.map((f) => docs.some((d) => filtersMatch(d, f)));
  };

  countDocs = async (
    Model: Model<any>,
    filter: object = {},
    session?: ClientSession
  ) => {
    const filterLength = Object.keys(filter).length;

    if (!filterLength) {
      return await Model.estimatedDocumentCount()
        .session(session ?? null)
        .exec();
    }

    return await Model.countDocuments(filter)
      .session(session ?? null)
      .exec();
  };

  dropMany = async (
    Model: Model<any>,
    conditions: object | undefined = {},
    session?: ClientSession
  ) => {
    return await Model.deleteMany(conditions, this.getSession(session)).exec();
  };

  dropOne = async (
    Model: Model<any>,
    conditions: object = {},
    session?: ClientSession
  ) => {
    return await Model.deleteOne(conditions, this.getSession(session)).exec();
  };

  editMany = async (
    Model: Model<any>,
    {
      filter = {},
      update = {},
      numberField = "",
      arrayField = "",
      element,
      mode,
    }: EditDTO,
    session?: ClientSession
  ) => {
    const opMap: Record<string, object> = {
      inc: { $inc: { [numberField]: 1 } },
      dec: { $inc: { [numberField]: -1 } },
      push: { $addToSet: { [arrayField]: element } },
      pull: { $pull: { [arrayField]: element } },
      "inc-push": {
        $addToSet: { [arrayField]: element },
        $inc: { [numberField]: 1 },
      },
      "dec-pull": {
        $pull: { [arrayField]: element },
        $inc: { [numberField]: -1 },
      },
      set: { $set: update },
    };

    return await Model.updateMany(
      filter,
      opMap[mode],
      this.getSession(session)
    ).exec();
  };

  editOne = async (
    Model: Model<any>,
    {
      filter = {},
      update = {},
      numberField = "",
      arrayField = "",
      element,
      mode,
    }: EditDTO,
    session?: ClientSession
  ) => {
    const opMap: Record<string, object> = {
      inc: { $inc: { [numberField]: 1 } },
      dec: { $inc: { [numberField]: -1 } },
      push: { $addToSet: { [arrayField]: element } },
      pull: { $pull: { [arrayField]: element } },
      "inc-push": {
        $addToSet: { [arrayField]: element },
        $inc: { [numberField]: 1 },
      },
      "dec-pull": {
        $pull: { [arrayField]: element },
        $inc: { [numberField]: -1 },
      },
      set: { $set: update },
    };

    const options: any = { new: true };
    if (session) options.session = session;
    return await Model.updateOne(filter, opMap[mode], options).exec();
  };

  getMany = async (
    Model: Model<any>,
    getManyDTO: GetManyDTO,
    session?: ClientSession
  ) => {
    const {
      page = 0,
      pageSize = 12,
      search = "",
      sort = "createdAt",
      order = Order.Descending,
      searchFields = [],
      searchMode = "or",
      select = "",
      populate = [],
      populateSelect = [],
      filter = {},
      type = "paged",
    } = getManyDTO;

    let searchQuery = {};

    if (search && searchFields.length) {
      const regex = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      const fields = searchFields.map((field) => ({
        [field]: { $regex: regex },
      }));

      searchQuery = searchMode === "and" ? { $and: fields } : { $or: fields };
    }

    let totalElements = 0;
    const queryFilter = search ? { ...filter, ...searchQuery } : filter;
    const filterLength = Object.keys(queryFilter).length;

    if (!filterLength) {
      totalElements = await Model.estimatedDocumentCount()
        .session(session ?? null)
        .exec();
    } else {
      totalElements = await Model.countDocuments(queryFilter)
        .session(session ?? null)
        .exec();
    }

    let query: any;

    if (type === "random") {
      // Works only when totalElements - pageSize > 0
      const max = Math.max(totalElements - pageSize, 1);
      const randomSkip = Math.max(0, Math.floor(Math.random() * max));

      query = Model.find(queryFilter, null, { session })
        .session(session ?? null)
        .skip(randomSkip)
        .limit(pageSize);
    } else if (type === "paged") {
      query = Model.find(queryFilter, null, { session })
        .session(session ?? null)
        .skip(page * pageSize)
        .limit(pageSize)
        .sort({
          [sort]: order === Order.Ascending ? 1 : -1,
          _id: order === Order.Ascending ? 1 : -1,
        });
    } else if (type === "all") {
      query = Model.find(queryFilter, null, { session }).session(
        session ?? null
      );
    }

    if (select.length) query = query.select(select);

    if (populate.length && populateSelect.length)
      populate.forEach(
        (p, i) => (query = query.populate(p, populateSelect[i]))
      );

    let documents = await query.exec();
    documents = documents.map((document: any) => this.convertId(document));

    return {
      content: documents,
      totalElements,
      totalPages: Math.ceil(totalElements / pageSize),
      pageSize,
      page,
      sort,
      order,
      filter,
      search,
      searchFields,
      searchMode,
      firstPage: page === 0,
      lastPage: totalElements
        ? page === Math.ceil(totalElements / pageSize) - 1
        : true,
      emptyPage: documents.length === 0,
    };
  };

  getOne = async (
    Model: Model<any>,
    getOneDTO: GetOneDTO,
    session?: ClientSession
  ) => {
    const {
      conditions = {},
      index = null,
      select = "",
      populate = [],
      populateSelect = [],
    } = getOneDTO;

    let query: any;

    // Either pass index or conditions object
    if (index !== null) {
      query = Model.findOne({}, null, { session })
        .session(session ?? null)
        .skip(index)
        .limit(1);
    } else if (Object.keys(conditions)[0] === "_id") {
      query = Model.findById(conditions._id, null, { session }).session(
        session ?? null
      );
    } else {
      query = Model.findOne({ ...conditions }, null, { session }).session(
        session ?? null
      );
    }

    if (select.length) query = query.select(select);

    if (populate.length && populateSelect.length)
      populate.forEach(
        (p, i) => (query = query.populate(p, populateSelect[i]))
      );

    const document: any = await query.exec();
    if (!document) return null;
    return this.convertId(document);
  };

  saveMany = async (
    Model: Model<any>,
    documents: object[],
    session?: ClientSession
  ) => {
    const options: InsertManyOptions = { ordered: false };
    if (session) options.session = session;
    await Model.insertMany(documents, options);
  };

  saveOne = async (
    Model: Model<any>,
    document: object,
    session?: ClientSession
  ) => {
    await Model.create([document], this.getSession(session));
  };
}
