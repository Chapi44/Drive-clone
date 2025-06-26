export interface IUser {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: "male" | "female" | "other";
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
