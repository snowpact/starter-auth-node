export interface ILoginSerializedResponse {
  accessToken: string;
  refreshToken: string;
}

export default (accessToken: string, refreshToken: string): ILoginSerializedResponse => ({
  accessToken,
  refreshToken,
});
