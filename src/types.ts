export interface Job {
  id: string;
  title: string;
  companyInfo: string;
  companyLogo?: string;
}

export interface JobDetail {
  id: string;
  title: string;
  description: string;
  location: string;
  url: string;
  employmentStatus: string;
  companyName: string;
  companyLogo?: string;
}
