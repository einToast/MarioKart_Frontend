import { render } from '@testing-library/react';
import SkeletonRoundComponentAll from './SkeletonRoundComponentAll';
import SkeletonTeamComponent from './SkeletonTeamComponent';
import SkeletonTeamStatistic from './SkeletonTeamStatistic';

const count = (container: HTMLElement, selector: string) => container.querySelectorAll(selector).length;

describe('SkeletonTeamComponent', () => {
    it('renders a list row placeholder with an avatar and two text lines', () => {
        const { container } = render(<SkeletonTeamComponent />);

        expect(count(container, '.teamContainer')).toBe(1);
        expect(count(container, '.swiper-slide')).toBe(0);
        expect(count(container, 'ion-skeleton-text')).toBe(3);
    });

    it('renders a slide placeholder for the swiper view', () => {
        const { container } = render(<SkeletonTeamComponent isSwiper={true} />);

        expect(count(container, '.swiper-slide')).toBe(1);
        expect(count(container, '.teamContainer')).toBe(0);
        expect(count(container, 'ion-skeleton-text')).toBe(3);
    });

    it('uses the neutral switch colour by default', () => {
        const { container } = render(<SkeletonTeamComponent />);

        expect((container.querySelector('.teamContainer > div') as HTMLElement).style.getPropertyValue('--switch-color')).toBe('#ECECEC');
    });

    it('uses the given switch colour', () => {
        const { container } = render(<SkeletonTeamComponent switchColor="#DA9DC9" />);

        expect((container.querySelector('.teamContainer > div') as HTMLElement).style.getPropertyValue('--switch-color')).toBe('#DA9DC9');
    });
});

describe('SkeletonRoundComponentAll', () => {
    it('renders four rows by default', () => {
        const { container } = render(<SkeletonRoundComponentAll />);

        expect(count(container, '.roundContainer > .teamContainer')).toBe(4);
    });

    it('renders the requested number of rows', () => {
        const { container } = render(<SkeletonRoundComponentAll rows={2} />);

        expect(count(container, '.roundContainer > .teamContainer')).toBe(2);
    });

    it('renders slides for the swiper view', () => {
        const { container } = render(<SkeletonRoundComponentAll rows={3} isSwiper={true} />);

        expect(count(container, '.roundContainer > .swiper-slide')).toBe(3);
    });
});

describe('SkeletonTeamStatistic', () => {
    it('renders four rows by default', () => {
        const { container } = render(<SkeletonTeamStatistic />);

        expect(count(container, '.roundContainer > .teamContainer')).toBe(4);
    });

    it('renders the requested number of rows, each with an avatar and three text lines', () => {
        const { container } = render(<SkeletonTeamStatistic rows={10} />);

        expect(count(container, '.roundContainer > .teamContainer')).toBe(10);
        expect(count(container, 'ion-skeleton-text')).toBe(40);
    });
});
