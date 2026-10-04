import { useEffect, useRef, useState } from 'react';
import aircraftCutout from './assets/aircraft-cutout.png';
import backgroundMusic from './assets/background-music.mp3';
import programmingStudy from './assets/programming-study.jpg';
import tamsuiRiverside from './assets/tamsui-riverside.jpg';
import haruPortrait from './assets/haru-portrait.png';
import haruFriends from './assets/haru-friends.png';

const DEPARTURE_AT = new Date('2026-10-17T13:00:00+07:00').getTime();
const DEPARTURE_KEY = 'hanh-trinh-dai-loan-da-khoi-hanh';

type Countdown = { days: number; hours: number; minutes: number; seconds: number };

function timeParts(totalSeconds: number): Countdown {
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function remainingTime(now: number): Countdown {
  return timeParts(Math.max(0, Math.floor((DEPARTURE_AT - now) / 1000)));
}

function elapsedTime(now: number): Countdown {
  return timeParts(Math.max(0, Math.floor((now - DEPARTURE_AT) / 1000)));
}

function KineticText({ text, className = '' }: { text: string; className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={textRef} className={`kinetic-text ${isVisible ? 'is-visible' : ''} ${className}`}>
      <span className="kinetic-text-visual" aria-hidden="true">
          {text.split(' ').filter(Boolean).map((word, wordIndex) => (
            <span className="kinetic-word" key={`${word}-${wordIndex}`}>
              {Array.from(word).map((character, characterIndex) => (
                <span className="kinetic-char" style={{ animationDelay: `${Math.min((wordIndex * 4 + characterIndex) * 18, 680)}ms` }} key={`${character}-${characterIndex}`}>{character}</span>
              ))}
            </span>
          ))}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

function App() {
  const [now, setNow] = useState(() => Date.now());
  const [hasDeparted, setHasDeparted] = useState(() => {
    const remembered = typeof window !== 'undefined' && window.localStorage.getItem(DEPARTURE_KEY) === 'true';
    return remembered || Date.now() >= DEPARTURE_AT;
  });
  const [musicOn, setMusicOn] = useState(false);
  const [activeSection, setActiveSection] = useState('loi-mo-dau');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasFlightSequence, setHasFlightSequence] = useState(false);
  const [titleFracturing, setTitleFracturing] = useState(false);
  const flightTimersRef = useRef<number[]>([]);
  const firstFlightTimerRef = useRef<number | null>(null);

  const startFlightSequence = () => {
    if (firstFlightTimerRef.current !== null) {
      window.clearTimeout(firstFlightTimerRef.current);
      firstFlightTimerRef.current = null;
    }
    flightTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    flightTimersRef.current = [];
    setHasFlightSequence(true);
    setTitleFracturing(false);

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const fractureTimer = window.setTimeout(() => setTitleFracturing(true), 2050);
      const rebuildTimer = window.setTimeout(() => setTitleFracturing(false), 4750);
      flightTimersRef.current = [fractureTimer, rebuildTimer];
    }
  };

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setTimeout(() => {
      firstFlightTimerRef.current = null;
      startFlightSequence();
    }, 1350);
    firstFlightTimerRef.current = timer;
    return () => {
      window.clearTimeout(timer);
      firstFlightTimerRef.current = null;
      flightTimersRef.current.forEach((flightTimer) => window.clearTimeout(flightTimer));
      flightTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (now >= DEPARTURE_AT && !hasDeparted) {
      setHasDeparted(true);
      window.localStorage.setItem(DEPARTURE_KEY, 'true');
    }
  }, [now, hasDeparted]);

  useEffect(() => {
    const sections = ['loi-mo-dau', 'ben-trong-toi', 'cong-nghe', 'hanh-trinh-tku', 'buoc-ngoat', 'loi-hua'];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: '-30% 0px -48% 0px', threshold: [0, 0.25, 0.6] });
    sections.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(decodeURIComponent(hash))?.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.motion-reveal, .threshold'));
    const showAll = () => elements.forEach((element) => element.classList.add('is-visible'));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      showAll();
      return;
    }

    const motionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          motionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

    elements.forEach((element) => motionObserver.observe(element));
    return () => motionObserver.disconnect();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;

    const updateScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        root.style.setProperty('--reading-progress', String(scrollable > 0 ? window.scrollY / scrollable : 0));
        frame = 0;
      });
    };

    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.32;
    const syncMusicState = () => setMusicOn(!audio.paused && !audio.ended);
    const playBackgroundMusic = async () => {
      try {
        await audio.play();
      } catch {
        syncMusicState();
      }
    };
    const removeGestureListeners = () => {
      window.removeEventListener('pointerdown', startAfterGesture);
      window.removeEventListener('keydown', startAfterGesture);
      window.removeEventListener('touchstart', startAfterGesture);
    };
    const startAfterGesture = (event: Event) => {
      removeGestureListeners();
      if (event.target instanceof Element && event.target.closest('[data-music-control]')) return;
      void playBackgroundMusic();
    };

    audio.addEventListener('play', syncMusicState);
    audio.addEventListener('pause', syncMusicState);
    audio.addEventListener('ended', syncMusicState);
    audio.addEventListener('error', syncMusicState);
    window.addEventListener('pointerdown', startAfterGesture);
    window.addEventListener('keydown', startAfterGesture);
    window.addEventListener('touchstart', startAfterGesture, { passive: true });
    void playBackgroundMusic();

    return () => {
      removeGestureListeners();
      audio.removeEventListener('play', syncMusicState);
      audio.removeEventListener('pause', syncMusicState);
      audio.removeEventListener('ended', syncMusicState);
      audio.removeEventListener('error', syncMusicState);
      audio.pause();
    };
  }, []);

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setMusicOn(false);
      }
    } else {
      audio.pause();
    }
  };

  const time = remainingTime(now);
  const elapsed = elapsedTime(now);
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const chapters = [
    { id: 'loi-mo-dau', label: 'Khoảng giữa' },
    { id: 'ben-trong-toi', label: 'Những điều bên trong' },
    { id: 'cong-nghe', label: 'Điều tôi muốn học' },
    { id: 'hanh-trinh-tku', label: 'Chặng đường TKU' },
    { id: 'buoc-ngoat', label: 'Một nơi xa lạ' },
    { id: 'loi-hua', label: 'Lời gửi ngày mai' },
  ];

  return (
    <main className="story-app">
      <audio ref={audioRef} className="hidden" src={backgroundMusic} loop preload="auto" aria-hidden="true" />
      <div className="reading-progress" aria-hidden="true"><span /></div>
      <header className="story-header fixed top-0 z-30 flex w-full items-center justify-between px-5 py-5 text-white md:px-12 md:py-7">
        <button className="flex items-center gap-3 border-0 bg-transparent p-0 text-left text-white" onClick={() => scrollTo('loi-mo-dau')} aria-label="Về đầu câu chuyện">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/35" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-[#e6b58e]" />
          </span>
          <span className="eyebrow hidden sm:block">Một hành trình đang mở</span>
        </button>
        <div className="header-controls">
          <button
            className="flex min-h-11 items-center gap-3 rounded-full border border-white/35 bg-[#172634]/25 px-4 text-[11px] tracking-wide text-white backdrop-blur-md transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0c8a3]"
            onClick={toggleMusic}
            data-music-control
            aria-pressed={musicOn}
            aria-label={musicOn ? 'Tạm dừng nhạc nền' : 'Phát nhạc nền'}
          >
            <span className={`music-bars ${musicOn ? 'is-playing' : ''}`} aria-hidden="true"><i /><i /><i /><i /></span>
            {musicOn ? 'Tạm dừng âm thanh' : 'Bật âm thanh'}
          </button>
        </div>
      </header>

      <nav className="chapter-rail" aria-label="Các chương trong câu chuyện">
        {chapters.map((chapter, index) => (
          <button
            key={chapter.id}
            aria-label={`Đến chương ${index + 1}: ${chapter.label}`}
            aria-current={activeSection === chapter.id ? 'step' : undefined}
            onClick={() => scrollTo(chapter.id)}
          >
            <span className="rail-dot" /><span className="rail-label">{chapter.label}</span>
          </button>
        ))}
      </nav>

      <section id="loi-mo-dau" className="hero relative flex min-h-[780px] items-end scroll-mt-0 md:min-h-[900px]">
        <div className="hero-shade" />
        <div className="hero-coordinate eyebrow absolute right-6 top-28 hidden text-white/65 md:block">10°49′ N &nbsp; 106°39′ E<br />VIỆT NAM · TRƯỚC GIỜ ĐI</div>
        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 pb-24 pt-40 text-[#f3efe7] md:px-[11.5%] md:pb-32">
          <p className="eyebrow reveal mb-8 text-[#f2c49a]">Việt Nam → Tamsui · Đài Loan</p>
          <h1 className={`serif hero-title reveal reveal-delay-1 max-w-[810px] text-[clamp(3.6rem,9vw,8.7rem)] leading-[.92] tracking-[-.055em] ${hasFlightSequence ? 'has-flown' : ''} ${titleFracturing ? 'is-fracturing' : ''}`}>
            <KineticText text="Ở giữa nơi" /><br />
            <KineticText text="đã quen" /> <em className="font-normal text-[#e6b58e]"><KineticText text="và" /></em><br />
            <KineticText text="điều chưa biết." className="kinetic-highlight" />
          </h1>
          <div className="reveal reveal-delay-2 mt-10 flex max-w-2xl flex-col gap-6 md:ml-[34%] md:mt-12 md:flex-row md:items-start md:gap-8">
            <span className="mt-1 h-px w-12 shrink-0 bg-[#e5b78e]" />
            <p className="max-w-[400px] text-[15px] leading-7 text-white/80 md:text-base">
              Ngày 17 tháng 10, tôi sẽ rời Việt Nam để bắt đầu chặng học tập mới tại Tamkang University (TKU), ở Tamsui, New Taipei.
            </p>
          </div>
          <div className="mt-20 flex items-center gap-3 text-white/55">
            <span className="eyebrow">Cuộn để đi tiếp</span>
            <span className="scroll-line" />
          </div>
        </div>
        <div className="hero-side-note eyebrow absolute bottom-12 right-8 hidden text-white/50 md:block">GHI LẠI TRƯỚC MỘT NGÃ RẼ</div>
      </section>

      <section id="countdown" className="countdown-wrap relative z-10 -mt-1 px-5 pb-16 md:px-12 md:pb-24">
        <div className={`countdown-panel motion-reveal mx-auto max-w-[1080px] ${hasDeparted ? 'is-departed' : ''}`}>
          <div className="countdown-topline">
            <span className="eyebrow">{hasDeparted ? 'Thời gian tôi đã ở Đài Loan' : 'Đếm ngược đến ngày đầu tiên ở TKU'}</span>
            <span className="mono text-[10px] tracking-[.11em] text-[#b9c8c1]">17.10.2026 &nbsp; / &nbsp; 13:00 · GIỜ VIỆT NAM</span>
          </div>
          {!hasDeparted ? (
            <div className="countdown-content">
              <div className="countdown-copy">
                <h2 className="serif text-3xl leading-tight md:text-[42px]"><KineticText text="Ngày tôi sẽ bước qua cánh cửa ấy." /></h2>
                <p>Việt Nam → Tamsui, Đài Loan.<br />Từng giây đang đưa tôi gần TKU hơn.</p>
              </div>
              <div className="time-grid" role="timer" aria-label={`${time.days} ngày ${time.hours} giờ ${time.minutes} phút ${time.seconds} giây đến ngày khởi hành`}>
                {[
                  { value: time.days, label: 'ngày' },
                  { value: time.hours, label: 'giờ' },
                  { value: time.minutes, label: 'phút' },
                  { value: time.seconds, label: 'giây' },
                ].map((part) => (
                  <div className="time-unit" key={part.label}>
                    <span className="time-number mono">{String(part.value).padStart(2, '0')}</span>
                    <span className="time-label">{part.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="countdown-content">
              <div className="countdown-copy">
                <h2 className="serif text-3xl leading-tight md:text-[42px]"><KineticText text="Tôi đã ở Đài Loan được..." /></h2>
                <p>Thời gian kể từ khi hành trình bắt đầu.<br />17.10.2026 · 13:00 giờ Việt Nam</p>
              </div>
              <div
                className="time-grid"
                role="timer"
                aria-label={`Thời gian đã ở Đài Loan: ${elapsed.days} ngày ${elapsed.hours} giờ ${elapsed.minutes} phút ${elapsed.seconds} giây`}
              >
                {[
                  { value: elapsed.days, label: 'ngày' },
                  { value: elapsed.hours, label: 'giờ' },
                  { value: elapsed.minutes, label: 'phút' },
                  { value: elapsed.seconds, label: 'giây' },
                ].map((part) => (
                  <div className="time-unit" key={part.label}>
                    <span className="time-number mono">{String(part.value).padStart(2, '0')}</span>
                    <span className="time-label">{part.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="countdown-foot">
            <span className="tiny-star" aria-hidden="true" />
            {hasDeparted
              ? '17.10.2026 · 13:00 · MỐC BẮT ĐẦU ĐẾM THỜI GIAN Ở ĐÀI LOAN.'
              : '17.10.2026 · 13:00 · NGÀY HÀNH TRÌNH ĐẾN TKU BẮT ĐẦU.'}
          </div>
        </div>
      </section>

      <section id="ben-trong-toi" className="inner-world content-section scroll-mt-20">
        <div className="section-index motion-reveal"><span>01</span><span className="index-line" /><span>THẬT LÒNG MÀ NÓI</span></div>
        <div className="inner-grid motion-reveal motion-stagger">
          <div className="sticky-note">
            <span className="eyebrow text-[#a9684d]">Những điều không dễ nói</span>
            <p className="serif">Tôi không bắt đầu bằng những điều tốt đẹp nhất về mình.</p>
            <div className="note-orbit" aria-hidden="true"><span /><span /><span /></div>
            <span className="mono mt-8 block text-[10px] tracking-[.12em] text-[#7d827b]">GHI CHÚ 01 &nbsp; / &nbsp; CON NGƯỜI THẬT</span>
          </div>
          <div className="prose-story">
            <p className="dropcap">Nếu phải dùng một đoạn văn để kể về con người thật của tôi, có lẽ tôi sẽ không bắt đầu bằng những điều tốt đẹp nhất về mình. Bởi tôi biết mình không phải một người hoàn hảo. Tôi có những điểm tốt, nhưng cũng có rất nhiều khuyết điểm, những nỗi sợ, những suy nghĩ tiêu cực và những điều tôi thường không nói ra với người khác.</p>
            <p>Tôi là người suy nghĩ khá nhiều. Đôi khi chỉ một câu nói, một hành động nhỏ hoặc một chuyện tưởng như chẳng đáng để ý cũng có thể khiến tôi suy nghĩ rất lâu. Có những chuyện tôi biết mình nên bỏ qua nhưng lại không thể ngừng nghĩ về nó. Chính điều đó khiến tôi đôi khi tự làm bản thân mệt mỏi.</p>
            <p>Tôi có thể không nói ra rằng mình buồn, nhưng không có nghĩa là tôi không buồn. Tôi có thể tỏ ra bình thường trước mặt người khác trong khi bên trong đang suy nghĩ rất nhiều. Tôi muốn có người hiểu mình, nhưng lại thường giấu đi những điều mình thật sự cảm thấy.</p>
            <div className="pull-quote">
              <span className="quote-mark">“</span>
              <p className="serif">Có những lúc tôi muốn được quan tâm nhưng lại không muốn phải mở lời.</p>
            </div>
            <p>Tôi đôi khi nóng vội, muốn mọi thứ có câu trả lời ngay lập tức. Tôi dễ lo lắng khi mọi thứ không diễn ra đúng kế hoạch. Có lúc tôi đặt kỳ vọng khá cao vào bản thân nhưng lại chưa có đủ sự kiên trì để đi đến cùng.</p>
            <p className="quiet-line">Tôi biết những điều đó là điểm yếu của mình.<br /><em>Và tôi vẫn đang học cách thay đổi.</em></p>
          </div>
        </div>
      </section>

      <section className="soft-truth relative px-6 py-24 md:py-36">
        <div className="soft-orb light-pulse" aria-hidden="true" />
        <div className="mx-auto grid max-w-[1060px] gap-12 md:grid-cols-[.7fr_1.3fr] md:gap-28 motion-reveal">
          <div className="eyebrow pt-2 text-[#d6ac88]">ĐIỀU TÔI ĐANG HỌC</div>
          <div>
            <p className="serif max-w-[720px] text-[clamp(2.1rem,4.5vw,4.25rem)] leading-[1.17] text-[#f0ece5]">
              Có thể tôi chán nản. Có thể có những ngày tôi không muốn làm gì.
              <em className="text-[#d9ad85]"> Nhưng rồi tôi vẫn tìm cách tiếp tục.</em>
            </p>
            <p className="mt-8 max-w-[460px] text-[15px] leading-7 text-[#bec6c2]">Không phải lúc nào cũng mạnh mẽ. Chỉ là, tôi chưa muốn đứng yên.</p>
          </div>
        </div>
        <div className="soft-coordinate mono">10°49′ N &nbsp; → &nbsp; 25°02′ N</div>
      </section>

      <section id="cong-nghe" className="technology content-section scroll-mt-20">
        <div className="section-index motion-reveal"><span>02</span><span className="index-line" /><span>MỘT SỰ TÒ MÒ CÓ HƯỚNG ĐI</span></div>
        <div className="tech-heading motion-reveal">
          <p className="eyebrow text-[#a9684d]">Những câu hỏi dẫn tôi đến đây</p>
          <h2 className="serif">Muốn biết,<br /><em>nó hoạt động thế nào.</em></h2>
        </div>
        <div className="tech-lower motion-reveal motion-stagger">
          <figure className="tech-photo">
            <img
              src={programmingStudy}
              alt="Sinh viên thực hành lập trình trên máy tính trong góc học tập buổi tối"
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <span className="eyebrow">HỌC · THỬ · TẠO RA</span>
              <span className="mono">CODE / PRACTICE</span>
            </figcaption>
          </figure>
          <div className="tech-copy">
            <p>Tôi thích tìm hiểu những thứ mới, thường có rất nhiều câu hỏi. Cách hoạt động, cách sử dụng, lựa chọn nào tốt hơn — tôi muốn hiểu thế giới xung quanh mình.</p>
            <p>Tôi đặc biệt bị thu hút bởi công nghệ. Máy tính, phần mềm, website, lập trình, những hệ thống phía sau Internet. Và cảm giác tự mình tạo ra một thứ gì đó.</p>
            <p>Tôi từng thử làm website, tìm hiểu code, bot và nhiều công cụ công nghệ khác. Tôi chưa phải một người giỏi về công nghệ. Nhưng tôi muốn trở thành người có năng lực thật sự trong lĩnh vực này.</p>
            <div className="tech-caption"><span className="caption-line" /><span className="eyebrow">TÒ MÒ, RỒI TỪNG BƯỚC THÀNH KỸ NĂNG</span></div>
          </div>
        </div>
      </section>

      <section className="choice-band px-6 py-24 md:px-16 md:py-36">
        <div className="choice-content motion-reveal">
          <span className="eyebrow">MỘT LỰA CHỌN CỦA RIÊNG TÔI</span>
          <h2 className="serif"><KineticText text="Tôi đã chọn" /><br /><em><KineticText text="Công nghệ thông tin." className="kinetic-highlight" /></em></h2>
          <p>Tôi không muốn học chỉ vì người khác bảo nên học gì. Tôi muốn học thứ mà mình có thể tiếp tục phát triển lâu dài. Muốn tự xây dựng những sản phẩm của riêng mình, và một ngày nào đó đứng bằng chính năng lực của mình.</p>
          <div className="choice-foot"><span>01 / HỌC HỎI</span><span>02 / XÂY DỰNG</span><span>03 / TỰ ĐỨNG VỮNG</span></div>
        </div>
        <span className="choice-watermark" aria-hidden="true">IT</span>
      </section>

      <section id="hanh-trinh-tku" className="tku-journey content-section scroll-mt-20">
        <div className="section-index motion-reveal"><span>TKU</span><span className="index-line" /><span>ĐIỂM ĐẾN TIẾP THEO</span></div>
        <div className="tku-story-grid">
          <div className="tku-story-copy motion-reveal">
            <span className="tku-location eyebrow"><span className="location-pulse" /> TAMSUI · NEW TAIPEI CITY · ĐÀI LOAN</span>
            <h2 className="serif">
              <KineticText text="Chặng đường mới," />
              <em><KineticText text="mái trường TKU." className="kinetic-highlight" /></em>
            </h2>
            <p>Tôi đang chuẩn bị cho hành trình học tập tại Tamkang University (TKU), ở Tamsui, New Taipei City. Từ Việt Nam đến một thành phố mới, tôi muốn học Công nghệ thông tin, làm quen với cuộc sống Đài Loan và trưởng thành hơn qua từng ngày.</p>
            <div className="tku-facts">
              <div><span className="eyebrow">NGÔI TRƯỜNG</span><strong>Tamkang University</strong><small>TKU · ĐẠM GIANG</small></div>
              <div><span className="eyebrow">NƠI ĐẾN</span><strong>Tamsui, New Taipei</strong><small>TAIWAN · 2026</small></div>
            </div>
            <button className="tku-countdown-link" onClick={() => scrollTo('countdown')}>
              <span>Ngày lên đường đang đến gần</span><span aria-hidden="true">↓</span>
            </button>
          </div>
          <div className="tku-gallery motion-reveal">
            <figure className="tku-photo tku-photo-main">
              <img src={haruPortrait} alt="Ảnh chân dung của Haru trước chuyến đi" loading="lazy" decoding="async" />
              <figcaption><span>HARU · TRƯỚC NGÀY LÊN ĐƯỜNG</span><span>01 / 02</span></figcaption>
              <span className="tku-photo-sticker">NEW<br />CHAPTER</span>
            </figure>
            <figure className="tku-photo tku-photo-friends">
              <img src={haruFriends} alt="Haru chụp ảnh cùng bạn bè" loading="lazy" decoding="async" />
              <figcaption><span>NHỮNG NGƯỜI TÔI MANG THEO TRONG KÝ ỨC</span></figcaption>
            </figure>
            <span className="tku-gallery-spark spark-one" aria-hidden="true">✳</span>
            <span className="tku-gallery-spark spark-two" aria-hidden="true">✦</span>
          </div>
        </div>
      </section>

      <section id="buoc-ngoat" className="turning-point content-section scroll-mt-20">
        <div className="section-index motion-reveal"><span>03</span><span className="index-line" /><span>MỘT NGÃ RẼ LỚN</span></div>
        <div className="turning-layout motion-reveal motion-stagger">
          <div className="turning-title">
            <span className="eyebrow text-[#a9684d]">RỜI KHỎI ĐIỀU QUEN THUỘC</span>
            <h2 className="serif"><KineticText text="Rồi Đài Loan" /><br /><em><KineticText text="xuất hiện." className="kinetic-highlight" /></em></h2>
            <div className="border-note">
              <span className="mono">VIỆT NAM</span>
              <span className="route-line"><i /></span>
              <span className="mono">ĐÀI LOAN</span>
            </div>
          </div>
          <div className="turning-copy">
            <p className="serif turning-lead">Một bước ngoặt rất lớn trong cuộc đời tôi.</p>
            <p>Phía sau là những năm tháng đã quen. Phía trước là một nơi xa lạ, một cuộc sống mới, và rất nhiều điều tôi chưa biết.</p>
            <p>Tôi biết sẽ có những lúc lo lắng. Có thể sẽ nhớ nhà. Có thể sẽ tự hỏi mình có làm được không. Nhưng tôi vẫn muốn tự mình đi tìm câu trả lời.</p>
            <div className="turning-aside"><span className="eyebrow">KHÔNG PHẢI VÌ TÔI HẾT SỢ</span><br /><span className="serif">Mà vì ước mơ này rõ hơn nỗi sợ.</span></div>
          </div>
        </div>
        <figure className="turning-photo motion-reveal">
          <img
            src={tamsuiRiverside}
            alt="Khung cảnh ven sông Tamsui lúc hoàng hôn, với những ngọn đồi phía xa"
            loading="lazy"
            decoding="async"
          />
          <figcaption>
            <span className="eyebrow">TAMSUI · NEW TAIPEI CITY</span>
            <span className="mono">MỘT NƠI MỚI ĐANG CHỜ</span>
          </figcaption>
        </figure>
      </section>

      <section className="threshold relative">
        <div className="threshold-wash" />
        <div className="threshold-text motion-reveal">
          <span className="eyebrow">Ở ĐÂY, MỌI THỨ VẪN CÒN THÂN THUỘC.</span>
          <p className="serif"><KineticText text="Tôi đã bắt đầu nhìn về phía trước." className="kinetic-highlight" /></p>
          <span className="mono threshold-stamp">17 / 10 / 2026 &nbsp; — &nbsp; 13:00</span>
        </div>
        <div className="threshold-flight" aria-hidden="true">
          <span className="flight-streak" />
          <img className="threshold-plane" src={aircraftCutout} alt="" />
        </div>
        <div className="threshold-coordinate eyebrow">MỘT CHÂN Ở LẠI<br />MỘT CHÂN ĐI TỚI</div>
      </section>

      <section id="loi-hua" className="letter-section scroll-mt-20">
        <div className="letter-kicker motion-reveal"><span className="eyebrow">GỬI NGƯỜI TÔI SẼ TRỞ THÀNH</span><span className="letter-date mono">MỘT LÁ THƯ CHƯA BIẾT NGÀY MỞ</span></div>
        <div className="letter-body motion-reveal">
          <span className="letter-mark serif">Một ngày nào đó,</span>
          <p>Nhưng tôi muốn tự mình đi tìm câu trả lời. Có thể vài năm sau, tôi sẽ đọc lại những dòng này và bật cười vì ngày hôm nay mình đã từng lo lắng nhiều đến thế. Cũng có thể tôi sẽ nhận ra mình đã thay đổi hoàn toàn.</p>
          <p>Nhưng dù tôi trở thành ai, tôi hy vọng mình vẫn nhớ được con người của ngày hôm nay — một người còn trẻ, còn nhiều thiếu sót, đôi khi yếu lòng, đôi khi bất an, nhưng vẫn có một ước mơ rất rõ ràng:</p>
          <p className="letter-dream">Rời khỏi nơi mình từng quen thuộc, bước đến một nơi xa lạ, học hỏi, trưởng thành và tự xây dựng tương lai bằng chính đôi tay của mình.</p>
          <div className="letter-ending">
            <p className="serif">Tôi chưa biết mình sẽ đi được bao xa.<br /><em>Nhưng tôi đã bắt đầu bước đi.</em></p>
            <span className="letter-signed eyebrow">— TÔI, TRƯỚC GIỜ KHỞI HÀNH</span>
          </div>
        </div>
        <div className="letter-bottom motion-reveal">
          <span className="eyebrow">MỘT CÂU CHUYỆN CHƯA VIẾT XONG</span>
          <button onClick={() => scrollTo('loi-mo-dau')} className="back-to-start">
            <span>Đọc lại từ đầu</span><span className="back-arrow" aria-hidden="true">↑</span>
          </button>
        </div>
      </section>

      <footer className="story-footer brand-footer">
        <div className="brand-footer-main">
          <div className="brand-identity">
            <span className="brand-emblem" aria-hidden="true">H</span>
            <div>
              <span className="brand-caption eyebrow">MỘT CÂU CHUYỆN ĐANG MỞ</span>
              <div className="brand-name">
                HARU88
                <svg className="brand-check" viewBox="0 0 24 24" role="img" aria-label="Dấu tick nhận diện HARU88">
                  <circle cx="12" cy="12" r="11" fill="currentColor" />
                  <path d="m6.8 12.4 3.4 3.3 7-7.2" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="brand-subtitle">Từng bước một. Từng ngày trưởng thành.</p>
            </div>
          </div>
          <div className="brand-route">
            <span className="eyebrow">MỘT CHẶNG ĐƯỜNG MỚI</span>
            <p className="serif">Việt Nam <span aria-hidden="true">→</span> TKU</p>
            <span className="mono">17.10.2026 · 13:00</span>
          </div>
        </div>

        <div className="contact-links" aria-label="Kết nối với HARU88">
          <a className="contact-link zalo-link" href="https://zalo.me/0988770961" target="_blank" rel="noopener noreferrer" aria-label="Kết nối qua Zalo với số 0988770961">
            <span className="contact-icon zalo-icon" aria-hidden="true">Z</span>
            <span className="contact-copy"><span className="eyebrow">KẾT NỐI QUA</span><strong>Zalo</strong><small>0988 770 961</small></span>
            <span className="contact-arrow" aria-hidden="true">↗</span>
          </a>
          <a className="contact-link facebook-link" href="https://www.facebook.com/Haru88gamebot" target="_blank" rel="noopener noreferrer" aria-label="Mở trang Facebook của HARU88">
            <span className="contact-icon facebook-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.5 1.6-1.5h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V21h3.4Z" fill="currentColor" /></svg>
            </span>
            <span className="contact-copy"><span className="eyebrow">THEO DÕI TẠI</span><strong>Facebook</strong><small>Haru88gamebot</small></span>
            <span className="contact-arrow" aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="brand-footer-bottom">
          <span className="mono">© 2026 HARU88 · MỘT HÀNH TRÌNH ĐANG MỞ</span>
          <button className="back-to-start footer-back" onClick={() => scrollTo('loi-mo-dau')}>
            <span>Trở về đầu trang</span><span className="back-arrow" aria-hidden="true">↑</span>
          </button>
        </div>
      </footer>
    </main>
  );
}

export default App;