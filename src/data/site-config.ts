import hero from '../assets/images/hero.jpg';
import type { SiteConfig } from '../types';

const siteConfig: SiteConfig = {
    website: 'https://gabGABY006.github.io',
    avatar: {
        src: hero,
        alt: 'Gabriella Castro'
    },
    title: 'Gabriella Castro',
    subtitle: 'Estudiante de Ingeniería de Sistemas | Entusiasta y desarrolladora UX/UI',
    description: 'Portafolio personal y blog tecnológico de Gabriella Castro. Explorando diseño UX/UI, ingeniería de software, creaciones en Figma, algoritmos y desarrollo web.',
    image: {
        src: '/dante-preview.jpg',
        alt: 'Portafolio de Gabriella Castro'
    },
    headerNavLinks: [
        {
            text: 'Inicio',
            href: '/'
        },
        {
            text: 'Acerca de',
            href: '/acerca'
        },
        {
            text: 'Evidencias',
            href: '/evidencias'
        },
        {
            text: 'GitHub',
            href: 'https://github.com/gabgaby006'
        }
    ],
    footerNavLinks: [
        {
            text: 'Acerca de',
            href: '/acerca'
        },
        {
            text: 'Evidencias',
            href: '/evidencias'
        },
        {
            text: 'Contacto',
            href: '/contact'
        }
    ],
    socialLinks: [
        {
            text: 'GitHub',
            href: 'https://github.com/gabgaby006'
        },
        {
            text: 'LinkedIn',
            href: 'https://www.linkedin.com/in/gabriella-michelle-castro-cuello-257283363/'
        },
        {
            text: 'Instagram',
            href: 'https://www.instagram.com/gabycas2007/'
        }
    ],
    hero: {
        title: '¡Hola! Bienvenido a mi rincón creativo.',
        text: "Soy **Gabriella Castro**, estudiante de Ingeniería de Sistemas apasionada por el **diseño UX/UI**, el desarrollo de software y los proyectos digitales con personalidad.\n\nAquí encontrarás ideas, exploraciones visuales y trabajos que reflejan mi estilo: Figma, creatividad, color y un toque muy rosa.\n\nPuedes revisar mis trabajos en [Evidencias](/evidencias), seguir mi código en [GitHub](https://github.com/gabgaby006) o escribirme por [Contacto](/contact).",
        image: {
            src: hero,
            alt: 'Configuración del espacio de trabajo'
        },
        actions: [
            {
                text: 'Ver evidencias',
                href: '/evidencias'
            },
            {
                text: 'Ponte en contacto',
                href: '/contact'
            }
        ]
    },
    subscribe: {
        enabled: true,
        title: 'Suscríbete a las actualizaciones',
        text: 'Recibe avisos cuando publique nuevos artículos, escritos de proyectos o notas técnicas.',
        form: {
            action: '#'
        }
    },
    postsPerPage: 8,
    projectsPerPage: 8
};

export default siteConfig;