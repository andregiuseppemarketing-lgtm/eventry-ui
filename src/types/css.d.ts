// Dichiarazioni di tipo per file CSS
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Supporto per CSS modules
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
