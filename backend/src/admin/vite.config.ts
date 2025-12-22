import { mergeConfig, type UserConfig } from 'vite';

export default (config: UserConfig) => {
    return mergeConfig(config, {
        server: {
            allowedHosts: [
                'wade-unmesmeric-unsomnolently.ngrok-free.dev', // 👈 Tu URL de Ngrok
                '.ngrok-free.dev' // (Opcional) Comodín para cualquier ngrok
            ],
        },
    });
};