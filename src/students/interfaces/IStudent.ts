export interface IStudent {
  id?: string;
  firstName: string;
  lastName: string;
  regEmail: string;
  mobile: string;
  rollNumber: string;
  linkedin: string;
  batch: string;
  branch: string;
  cgpa: number;
  role: string 
  resume?: {
    url: string;
    lastUpdated: Date;
  };
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
