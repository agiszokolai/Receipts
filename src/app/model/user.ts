export interface IUser {
  userId: string;
  name: string;
  username: string;
  email: string;
  password: string;
  description?: string;
  profilePictureUrl?: string;
  receipts: IUserReceipts;
}

export interface IUserReceipts {
  saved: number[];
  liked: number[];
  created: number[];
  collections?: ISavedReceiptCollection[];
}

export interface ISavedReceiptCollection {
  id: number;
  name: string;
  receipts: number[];
}
export interface IlogIn {
  email: string;
  password: string;
}
export interface IUserRegistration {
  email: string;
  password: string;
  name: string;
  userName: string;
}
