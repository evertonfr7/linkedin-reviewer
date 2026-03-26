declare module 'node-pdftotext' {
  interface GetTextOptions {
    layout?: boolean;
    page?: number;
    start?: number;
    end?: number;
    physicalLayout?: boolean;
    newline?: boolean;
  }
  
  function getText(filePath: string, options?: GetTextOptions): Promise<string>;
  function getText(buffer: Buffer, options?: GetTextOptions): Promise<string>;
  
  export { getText, GetTextOptions };
}
