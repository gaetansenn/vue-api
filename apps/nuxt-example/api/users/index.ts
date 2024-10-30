import type { Field, IRequestOptions } from "@vue-api/core";

interface Project {
  name: string;
  status: string;
  statusSummary?: string;
}

interface Department {
  title: string;
  role: string;
  projects: Project[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  departments: {
    [key: string]: Department;
  };
  skills: string[];
  departmentSummary?: { [key: string]: string };
  totalProjects?: number;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  avatar: string;
  totalProjects?: number;
  departmentSummary?: { [key: string]: string };
}

export default async function () {
  const { useFetch } = useFetchModel({
    baseURL: "https://64cbdfbd2eafdcdc85196e4c.mockapi.io/users",
  });

  const USER_FIELDS: Field[] = [
    { key: "*", omit: ["password"] },
    "departments",
    {
      key: "departments.*.projects",
      fields: [
        "*",
        {
          key: "statusSummary",
          mapping: ({ model }: { model: Project }) => {
            const statusEmoji =
              model.status.toLowerCase() === "completed"
                ? "✅"
                : model.status.toLowerCase() === "in progress"
                  ? "🚧"
                  : "🔜";
            return `${statusEmoji} ${model.name} (${model.status})`;
          },
        },
      ],
    },
    {
      key: "departmentSummary",
      mapping: ({ model }: { model: User }) => {
        return Object.entries(model.departments).reduce(
          (acc, [key, dept]) => {
            acc[key] =
              `${dept.role} in ${dept.title} (${dept.projects.length} projects)`;
            return acc;
          },
          {} as { [key: string]: string }
        );
      },
    },
    {
      key: "totalProjects",
      mapping: ({ model }: { model: User }) => {
        return Object.values(model.departments).reduce(
          (total, dept) => total + dept.projects.length,
          0
        );
      },
    },
  ];

  const USERS_FIELDS: Field[] = [
    "id",
    "name",
    "email",
    "avatar",
    {
      key: "totalProjects",
      mapping: ({ model }: { model: User }) => {
        return Object.values(model.departments).reduce(
          (total, dept) => total + dept.projects.length,
          0
        );
      },
    },
    {
      key: "departmentSummary",
      mapping: ({ model }: { model: User }) => {
        return Object.entries(model.departments).reduce(
          (acc, [key, dept]) => {
            acc[key] =
              `${dept.role} in ${dept.title} (${dept.projects.length} projects)`;
            return acc;
          },
          {} as { [key: string]: string }
        );
      },
    },
  ];

  return {
    findOne: async (
      userId: string,
      options?: IRequestOptions<Omit<RequestInit, "body">>
    ) => {
      return useFetch.get<User>(userId, {
        ...options,
        transform: {
          fields: USER_FIELDS,
          context: {},
        },
      });
    },
    get: async (options?: IRequestOptions<Omit<RequestInit, "body">>) => {
      return useFetch.get<UserListItem[]>({
        ...options,
        transform: {
          fields: USERS_FIELDS,
          context: {},
        },
      });
    }
  };
}
