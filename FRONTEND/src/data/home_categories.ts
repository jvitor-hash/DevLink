export type HomeCategory = {
  label: string;
  value: string;
  subCategories: Array<{ label: string; value: string }>;
};

export const homeCategories: HomeCategory[] = [
  { label: "Websites", value: "WEBSITES", subCategories: [
    { label: "WordPress", value: "WORDPRESS" }, { label: "Shopify", value: "SHOPIFY" },
    { label: "Sites personalizados", value: "PERSONALIZED_WEBSITES" }, { label: "Wix & Webflow", value: "WIX_WEBFLOW" },
    { label: "Squarespace & WooCommerce", value: "SQUARESPACE_WOOCOMMERCE" },
  ] },
  { label: "Desenvolvimento de Apps", value: "APP_DEVELOPMENT", subCategories: [
    { label: "Aplicação Full-Stack", value: "FULL_STACK_APPLICATION" }, { label: "Aplicação Desktop & Jogos", value: "DESKTOP_GAMES_APLICATION" },
    { label: "Extensão de navegador", value: "BROWSER_EXTENSION" }, { label: "Desenvolvimento de APIs", value: "APIS_DEVELOPMENT" }, { label: "Chatbots AI", value: "CHATBOTS_AI" },
  ] },
  { label: "Plataforma Mobile", value: "PLATFORM_MOBILE", subCategories: [
    { label: "Desenvolvimento Mobile", value: "DEVELOPMENT_MOBILE" }, { label: "Aplicativos Multiplataforma", value: "MULTIPLATFORM_APLICATIONS" },
    { label: "Aplicativos Android", value: "ANDROID_APLICATIONS" }, { label: "Aplicativos iOS", value: "IOS_APLICATIONS" },
  ] },
  { label: "Suporte e Cibersegurança", value: "SUPORT_CYBERSECURITY", subCategories: [
    { label: "Cloud Computing & DevOps", value: "CLOUD_COMPUTING_DEVOPS" }, { label: "Cibersegurança", value: "CYBERSECURITY" },
    { label: "Suporte e TI", value: "SUPORT_IT" }, { label: "Manutenção de Sistemas", value: "SYSTEMS_MAINTENANCE" },
  ] },
  { label: "Blockchain & Web3", value: "BLOCKCHAIN_WEB3", subCategories: [
    { label: "Desenvolvimento Blockchains", value: "DEVELOPMENT_BLOCKCHAINS" }, { label: "Apps Descentralizados", value: "DECENTRALIZED_APPS" }, { label: "Criptomoedas e Tokens", value: "CYPTOCURRENCY_TOKENS" },
  ] },
];
