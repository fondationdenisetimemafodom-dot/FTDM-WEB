import axiosInstance from "../lib/axiosInstance";

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const deleteMessage = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/messages/${id}`);
};

export const deleteVolunteer = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/volunteers/${id}`);
};

export const deletePartnership = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/partnerships/${id}`);
};
