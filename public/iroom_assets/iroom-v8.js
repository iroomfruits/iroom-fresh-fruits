(function(){
  const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
  const root=$('#iroomFinalBase'); if(!root)return;
  const assets='./iroom_assets/';
  const PUBLIC_DEFAULT={
    siteName:'이룸 fresh fruits',
    businessNo:'775-97-00292',
    address:'서울특별시 송파구 송이로15길 33, 상가동 B-103호',
    mailOrderNo:'제 2025-서울 송파 -1052호',
    bandUrl:'https://band.us/@iroomfruits',
    kakaoUrl:'https://open.kakao.com/o/sd7wnrKi',
    kakaoJoinUrl:'',
    kakaoEnabled:false,
    kakaoJsKey:'',
    kakaoRedirectUri:''
  };
  let publicSite={...PUBLIC_DEFAULT};
  const seasons={
    spring:{label:'봄',art:'hero_final/spring.png',curation:'card_art/spring_curation.jpg',gift:'card_art/spring_gift.jpg',premium:'card_art/spring_premium.jpg',premiumFruits:['금실딸기','성주참외','대저토마토','샤인머스캣'],seasonalFruits:['딸기','참외','토마토','청포도'],library:['블루베리','파인애플','망고','자몽','체리','멜론']},
    summer:{label:'여름',art:'hero_final/summer.png',curation:'card_art/summer_curation.jpg',gift:'card_art/summer_gift.jpg',premium:'card_art/summer_premium.jpg',premiumFruits:['백도복숭아','고당도수박','샤인머스캣','머스크멜론'],seasonalFruits:['수박','복숭아','자두','포도'],library:['파인애플','키위','블루베리','청포도','자몽','체리']},
    autumn:{label:'가을',art:'hero_final/autumn.png',curation:'card_art/autumn_curation.jpg',gift:'card_art/autumn_gift.jpg',premium:'card_art/autumn_premium.jpg',premiumFruits:['홍로사과','나주배','샤인머스캣','대봉'],seasonalFruits:['사과','배','감','대봉'],library:['석류','포도','블랙베리','자몽','샤인머스캣','사과']},
    winter:{label:'겨울',art:'hero_final/winter.png',curation:'card_art/winter_curation.jpg',gift:'card_art/winter_gift.jpg',premium:'card_art/winter_premium.jpg',premiumFruits:['제주감귤','한라봉','금실딸기','부사사과'],seasonalFruits:['제주감귤','한라봉','딸기','사과'],library:['키위','금귤','배','블루베리','자몽','오렌지']}
  };
  const heroCopy={
    spring:{title:'봄 제철 과일',desc:'봄의 싱그러움을<br>가장 특별한 선물로',tag:'PREMIUM FRESH FRUITS · IN SPRING'},
    summer:{title:'여름의 과일',desc:'햇살이 더 달콤하게<br>만드는 계절의 선물',tag:'PREMIUM FRESH FRUITS · IN SUMMER'},
    autumn:{title:'가을 프리미엄 과일',desc:'깊어가는 계절이 전하는<br>가장 특별한 선물',tag:'PREMIUM FRESH FRUITS · IN AUTUMN'},
    winter:{title:'겨울 프리미엄 과일',desc:'차가운 계절에 더욱 빛나는<br>자연의 달콤한 선물',tag:'PREMIUM FRESH FRUITS · IN WINTER'}
  };
  const fruitMeta={
    '딸기':['fruits/01_딸기_strawberry.png','향긋하고 산뜻한 단맛'],
    '참외':['fruits/02_참외_korean_melon.png','아삭하고 맑은 달콤함'],
    '청포도':['fruits/03_청포도_green_grape.png','청량하고 향긋한 단맛'],
    '체리':['fruits/04_체리_cherry.png','상큼하고 진한 과즙'],
    '수박':['fruits/05_수박_watermelon.png','시원하고 풍부한 과즙'],
    '천도복숭아':['fruits/06_복숭아_peach.png','산뜻하고 향긋한 여름 맛'],
    '복숭아':['fruits/06_복숭아_peach.png','부드럽고 향긋한 여름의 단맛'],
    '사과':['fruits/09_사과_apple.png','아삭하고 선명한 달콤함'],
    '배':['fruits/10_배_pear.png','시원하고 풍부한 과즙'],
    '감':['fruits/11_감_persimmon.png','깊고 진한 계절의 단맛'],
    '대봉':['fruits/11_감_persimmon.png','후숙할수록 부드럽고 깊어지는 가을 단맛'],
    '샤인머스캣':['fruits/12_샤인머스캣_shine_muscat.png','향긋하고 맑은 달콤함'],
    '한라봉':['fruits/13_한라봉_hallabong.png','진한 향과 산뜻한 단맛'],
    '키위':['fruits/19_키위_kiwi.png','상큼하고 깊은 달콤함'],
    '자두':['fruits/27_자두_plum.png','새콤달콤한 여름 과즙'],
    '토마토':['fruits/37_토마토_tomato.png','신선하고 산뜻한 자연의 맛'],
    '망고':['fruits/07_망고_mango.png','부드럽고 진한 열대의 달콤함'],
    '파인애플':['fruits/18_파인애플_pineapple.png','상큼하고 풍부한 과즙'],
    '멜론':['fruits/28_멜론_melon.png','부드럽고 은은한 달콤함'],
    '블루베리':['fruits/16_블루베리_blueberry.png','작지만 깊고 산뜻한 맛'],
    '석류':['fruits/24_석류_pomegranate.png','선명하고 진한 가을빛'],
    '무화과':['fruits/25_무화과_fig.png','부드럽고 깊은 계절의 맛'],
    '밤':['fruits/26_밤_chestnut.png','고소하고 포근한 가을 맛'],
    '포도':['fruits/08_포도_purple_grape.png','풍부한 향과 진한 단맛'],
    '블랙베리':['fruits/34_블랙베리_blackberry.png','짙은 향과 산뜻한 균형'],
    '자몽':['fruits/15_자몽_grapefruit.png','상큼하고 깨끗한 균형'],
    '오렌지':['fruits/21_오렌지_orange.png','싱그럽고 풍부한 과즙'],
    '제주감귤':['fruits/21_오렌지_orange.png','산뜻한 향과 친숙한 겨울의 달콤함'],
    '레몬':['fruits/14_레몬_lemon.png','상큼하고 선명한 향'],
    '금귤':['fruits/35_금귤_kumquat.png','작고 향긋한 겨울의 맛']
  };
  const fruitAliasBase={
    '금실딸기':'딸기','성주참외':'참외','대저토마토':'토마토',
    '백도복숭아':'복숭아','고당도수박':'수박','머스크멜론':'멜론',
    '홍로사과':'사과','나주배':'배','부사사과':'사과'
  };
  const premiumTaglines={
    '금실딸기':'국산 프리미엄 딸기의 향긋한 단맛',
    '성주참외':'아삭하고 맑은 국산 참외의 달콤함',
    '대저토마토':'산뜻한 감칠맛과 균형 잡힌 풍미',
    '백도복숭아':'부드러운 과육과 풍부한 향',
    '고당도수박':'시원한 과즙과 선명한 여름 단맛',
    '머스크멜론':'은은한 향과 부드러운 고급 단맛',
    '홍로사과':'아삭한 식감과 산뜻한 국산 사과의 맛',
    '나주배':'시원한 과즙과 깔끔한 단맛',
    '부사사과':'단단한 식감과 깊은 겨울 단맛'
  };
  Object.entries(fruitAliasBase).forEach(([name,base])=>{
    if(!fruitMeta[name]&&fruitMeta[base])fruitMeta[name]=[fruitMeta[base][0],premiumTaglines[name]||fruitMeta[base][1]];
  });
  const fruitDetails={
    '딸기':{season:'겨울 · 봄',summary:'향긋한 향과 산뜻한 단맛, 부드러운 과육이 매력적인 과일입니다.',choose:'꼭지가 싱싱하고 표면의 붉은 빛이 고르며 과육이 무르지 않은 것을 살펴봅니다.',keep:'씻지 않은 상태로 냉장 보관하고, 드시기 직전에 가볍게 세척하는 것이 좋습니다.',enjoy:'차갑게 그대로 즐기거나 요거트·디저트와 함께하면 향이 잘 살아납니다.'},
    '참외':{season:'봄 · 초여름',summary:'아삭한 식감과 맑고 시원한 달콤함이 특징입니다.',choose:'껍질의 노란색과 흰 줄이 선명하고 묵직하며 향이 은은한 것을 살펴봅니다.',keep:'서늘한 곳에 두었다가 충분히 익으면 냉장 보관해 시원하게 즐기세요.',enjoy:'차갑게 잘라 먹거나 샐러드에 곁들이면 산뜻한 단맛을 즐길 수 있습니다.'},
    '청포도':{season:'여름 · 가을',summary:'청량한 과즙과 산뜻한 향이 어우러지는 가벼운 달콤함이 매력입니다.',choose:'알이 탱탱하고 송이에 단단히 붙어 있으며 줄기가 지나치게 마르지 않은 것을 살펴봅니다.',keep:'씻지 않은 채 냉장 보관하고 드실 만큼만 꺼내 세척하세요.',enjoy:'충분히 차갑게 하면 아삭한 식감과 향이 더 또렷하게 느껴집니다.'},
    '체리':{season:'봄 · 여름',summary:'작은 한 알에 상큼함과 깊은 단맛이 함께 들어 있는 과일입니다.',choose:'표면이 매끈하고 윤기가 있으며 꼭지가 푸르고 과육이 단단한 것을 살펴봅니다.',keep:'습기를 줄여 냉장 보관하고 먹기 직전에 세척하는 편이 좋습니다.',enjoy:'그대로 먹거나 치즈·요거트와 곁들이면 풍부한 향을 즐길 수 있습니다.'},
    '수박':{season:'여름',summary:'풍부한 수분과 시원한 과즙으로 여름에 가장 잘 어울리는 과일입니다.',choose:'크기에 비해 묵직하고 껍질의 무늬가 선명하며 모양이 고른 것을 살펴봅니다.',keep:'통째로는 서늘한 곳에, 자른 뒤에는 밀폐해 냉장 보관하세요.',enjoy:'충분히 차갑게 먹으면 수분감과 청량감이 가장 좋습니다.'},
    '천도복숭아':{season:'여름',summary:'산뜻한 산미와 향긋한 단맛, 매끄러운 껍질이 특징인 여름 과일입니다.',choose:'은은한 향이 나고 과육이 너무 딱딱하지 않으며 멍이 적은 것을 살펴봅니다.',keep:'단단할 때는 실온에서 후숙한 뒤 냉장 보관하고 너무 오래 차갑게 두지 않는 것이 좋습니다.',enjoy:'먹기 전 잠시 차갑게 두면 향과 과즙의 균형이 좋습니다.'},
    '복숭아':{season:'여름',summary:'부드러운 과육과 풍부한 향, 촉촉한 과즙이 어우러지는 대표 여름 과일입니다.',choose:'향이 은은하게 올라오고 표면에 큰 멍이 없으며 손으로 살짝 눌렀을 때 적당한 탄력이 있는 것을 살펴봅니다.',keep:'단단할 때는 실온에서 후숙한 뒤 먹기 좋은 상태가 되면 냉장 보관하세요.',enjoy:'먹기 전 잠시 차갑게 두면 향과 과즙, 부드러운 식감을 균형 있게 즐길 수 있습니다.'},
    '사과':{season:'가을 · 겨울',summary:'아삭한 식감과 선명한 단맛, 산뜻한 향의 균형이 좋은 기본 과일입니다.',choose:'표면이 단단하고 묵직하며 멍이나 눌림이 적은 것을 살펴봅니다.',keep:'다른 과일과 분리해 냉장 보관하면 아삭함을 오래 유지하는 데 도움이 됩니다.',enjoy:'그대로 먹거나 치즈·견과류와 곁들이면 단맛과 향이 잘 어울립니다.'},
    '배':{season:'가을 · 겨울',summary:'시원하고 풍부한 과즙과 부드러운 단맛이 돋보입니다.',choose:'모양이 고르고 묵직하며 껍질에 상처가 적고 단단한 것을 살펴봅니다.',keep:'냉장 보관하면 시원한 과즙과 아삭한 식감을 유지하기 좋습니다.',enjoy:'차갑게 잘라 그대로 먹으면 배 특유의 시원한 단맛이 가장 잘 살아납니다.'},
    '감':{season:'가을',summary:'계절이 깊어질수록 진해지는 부드럽고 풍성한 단맛이 매력입니다.',choose:'색이 고르고 꼭지 주변이 깨끗하며 단단함이 용도에 맞는 것을 고릅니다.',keep:'단단한 감은 서늘한 곳에, 충분히 익은 감은 냉장 보관하세요.',enjoy:'단단할 때의 아삭함과 후숙했을 때의 부드러움을 취향에 따라 즐길 수 있습니다.'},
    '대봉':{season:'가을 · 초겨울',summary:'큼직한 과실이 충분히 후숙되면 촉촉하고 진한 단맛을 즐길 수 있는 가을 대표 과일입니다.',choose:'색이 고르고 꼭지가 단단히 붙어 있으며 상처가 적은 것을 고릅니다. 후숙용은 지나치게 무르지 않은 것이 좋습니다.',keep:'상온에서 부드럽게 후숙한 뒤 먹기 좋은 상태가 되면 냉장 보관하세요.',enjoy:'완전히 후숙해 숟가락으로 떠먹거나 살짝 얼려 홍시처럼 즐기면 좋습니다.'},
    '샤인머스캣':{season:'여름 · 가을',summary:'아삭한 식감과 향긋하고 맑은 단맛으로 선물용으로도 인기 있는 포도입니다.',choose:'알이 탱탱하고 송이가 단정하며 줄기가 지나치게 마르지 않은 것을 살펴봅니다.',keep:'씻지 않은 상태로 냉장 보관하고 드실 만큼만 세척하세요.',enjoy:'충분히 차갑게 하면 향과 아삭함이 더 또렷하게 느껴집니다.'},
    '한라봉':{season:'겨울 · 봄',summary:'진한 감귤 향과 산뜻한 단맛, 풍부한 과즙이 특징입니다.',choose:'껍질 색이 고르고 손에 들었을 때 묵직하며 향이 선명한 것을 살펴봅니다.',keep:'서늘한 곳이나 냉장실에 두되 습기가 차지 않도록 보관하세요.',enjoy:'실온에 잠시 두었다 먹으면 향이 더 풍부하게 느껴질 수 있습니다.'},
    '키위':{season:'연중 · 겨울 추천',summary:'상큼함과 깊은 단맛이 함께 있고 부드러운 과육이 매력적인 과일입니다.',choose:'겉에 상처가 적고 손으로 살짝 눌렀을 때 취향에 맞는 탄력이 있는 것을 고릅니다.',keep:'단단한 것은 실온 후숙, 먹기 좋은 상태가 되면 냉장 보관하세요.',enjoy:'반으로 잘라 스푼으로 먹거나 샐러드와 함께 즐기기 좋습니다.'},
    '자두':{season:'여름',summary:'새콤달콤한 과즙과 선명한 향으로 여름에 잘 어울립니다.',choose:'표면이 매끈하고 적당히 탄력이 있으며 향이 은은한 것을 살펴봅니다.',keep:'단단하면 실온에서 잠시 후숙하고 익으면 냉장 보관하세요.',enjoy:'너무 차갑지 않게 먹으면 향과 단맛이 더 잘 느껴집니다.'},
    '토마토':{season:'봄 · 여름',summary:'산뜻한 산미와 자연스러운 단맛, 신선한 과즙을 즐길 수 있습니다.',choose:'색이 고르고 꼭지가 싱싱하며 표면에 상처가 적은 것을 살펴봅니다.',keep:'완전히 익기 전에는 서늘한 실온, 잘 익은 뒤에는 짧게 냉장 보관하세요.',enjoy:'그대로 먹거나 샐러드·치즈와 곁들이면 산뜻한 맛이 잘 살아납니다.'},
    '망고':{season:'여름 · 수입과일',summary:'부드럽고 진한 열대의 단맛과 풍부한 향이 특징입니다.',choose:'껍질 상태가 깨끗하고 향이 은은하며 살짝 눌렀을 때 부드러운 탄력이 있는 것을 고릅니다.',keep:'단단하면 실온에서 후숙하고 먹기 좋은 상태가 되면 냉장 보관하세요.',enjoy:'차갑게 잘라 먹거나 요거트·디저트와 함께 즐기기 좋습니다.'},
    '파인애플':{season:'연중 · 여름 추천',summary:'상큼한 산미와 풍부한 과즙, 강한 열대 향이 매력적입니다.',choose:'향이 선명하고 묵직하며 잎과 껍질 상태가 지나치게 마르지 않은 것을 살펴봅니다.',keep:'손질 전에는 서늘하게, 손질 후에는 밀폐해 냉장 보관하세요.',enjoy:'차갑게 먹거나 구워서 즐기면 단맛의 인상이 달라집니다.'},
    '멜론':{season:'여름',summary:'부드러운 식감과 은은하게 퍼지는 단맛이 특징입니다.',choose:'향이 은은하고 묵직하며 꼭지 반대쪽에 적당한 탄력이 있는 것을 살펴봅니다.',keep:'실온에서 후숙한 뒤 먹기 좋은 상태가 되면 냉장 보관하세요.',enjoy:'먹기 전에 충분히 차갑게 하면 부드러운 단맛을 더 깔끔하게 즐길 수 있습니다.'},
    '블루베리':{season:'여름 · 수입 연중',summary:'작은 알에 산뜻한 맛과 짙은 베리 향이 담겨 있습니다.',choose:'표면의 하얀 과분이 자연스럽고 알이 단단하며 무르지 않은 것을 살펴봅니다.',keep:'씻지 않고 냉장 보관하며 물기에 약하므로 먹기 직전에 세척하세요.',enjoy:'그대로 먹거나 요거트·샐러드·디저트에 곁들이기 좋습니다.'},
    '석류':{season:'가을 · 겨울',summary:'선명한 색과 톡톡 터지는 과즙, 산뜻한 산미가 매력입니다.',choose:'들었을 때 묵직하고 껍질이 지나치게 갈라지지 않은 것을 살펴봅니다.',keep:'통째로는 서늘하거나 냉장 보관하고 알을 분리한 뒤에는 밀폐해 냉장 보관하세요.',enjoy:'알 그대로 먹거나 샐러드·요거트에 올리면 색감과 산뜻함을 더할 수 있습니다.'},
    '무화과':{season:'여름 · 가을',summary:'부드러운 과육과 은은하고 깊은 단맛이 특징인 섬세한 과일입니다.',choose:'표면에 큰 상처가 없고 부드러운 탄력과 은은한 향이 있는 것을 고릅니다.',keep:'쉽게 무르므로 구매 후 빠르게 냉장 보관하고 가급적 빨리 즐기세요.',enjoy:'그대로 먹거나 치즈·견과류와 곁들이면 부드러운 단맛이 잘 어울립니다.'},
    '밤':{season:'가을 · 겨울',summary:'고소하고 포근한 맛으로 가을 분위기를 가장 잘 보여주는 열매 중 하나입니다.',choose:'껍질에 윤기가 있고 단단하며 벌레 먹은 흔적이나 구멍이 없는 것을 살펴봅니다.',keep:'장기 보관 시에는 냉장·냉동을 활용하고 습기가 차지 않도록 관리하세요.',enjoy:'삶거나 구워 먹으면 고소함과 자연스러운 단맛이 잘 살아납니다.'},
    '포도':{season:'여름 · 가을',summary:'풍부한 향과 진한 단맛, 탱글한 식감이 매력입니다.',choose:'알이 단단하고 송이에 잘 붙어 있으며 줄기가 너무 마르지 않은 것을 살펴봅니다.',keep:'씻지 않은 채 냉장 보관하고 먹기 직전에 세척하세요.',enjoy:'차갑게 먹으면 포도의 향과 당도가 더 선명하게 느껴집니다.'},
    '블랙베리':{season:'여름 · 수입 연중',summary:'짙은 베리 향과 산뜻한 산미가 어우러지는 과일입니다.',choose:'알이 무르지 않고 윤기가 있으며 즙이 새지 않는 것을 살펴봅니다.',keep:'물기에 약하므로 씻지 않은 채 냉장 보관하고 빠르게 즐기세요.',enjoy:'요거트·디저트·샐러드에 곁들이면 향과 색감이 돋보입니다.'},
    '자몽':{season:'겨울 · 수입 연중',summary:'상큼함과 은은한 쌉싸름함이 어우러지는 깨끗한 맛이 특징입니다.',choose:'크기에 비해 묵직하고 껍질이 탄탄하며 향이 은은한 것을 살펴봅니다.',keep:'서늘한 곳 또는 냉장 보관하며 자른 뒤에는 밀폐 보관하세요.',enjoy:'그대로 먹거나 샐러드·음료에 더하면 산뜻한 풍미를 즐길 수 있습니다.'},
    '오렌지':{season:'겨울 · 수입 연중',summary:'싱그러운 향과 풍부한 과즙, 친숙한 달콤함이 매력입니다.',choose:'크기에 비해 묵직하고 껍질이 탄탄하며 상처가 적은 것을 살펴봅니다.',keep:'서늘한 곳이나 냉장 보관하고 건조하지 않게 관리하세요.',enjoy:'실온에 잠시 두었다 먹으면 감귤 향이 더 잘 느껴질 수 있습니다.'},
    '제주감귤':{season:'겨울',summary:'겨울이면 가장 먼저 떠오르는 친숙한 감귤 향과 산뜻한 단맛, 풍부한 과즙이 매력입니다.',choose:'껍질 색이 고르고 손에 들었을 때 묵직하며 지나치게 말랑하거나 상처 난 과실은 피합니다.',keep:'통풍이 잘되는 서늘한 곳에 두고 오래 보관할 때는 상태를 확인하며 냉장 보관하세요.',enjoy:'실온에서 향을 살려 먹거나 차갑게 두어 상큼하게 즐겨도 좋습니다.'},
    '레몬':{season:'연중',summary:'선명한 산미와 향으로 다른 과일과 음식의 맛을 또렷하게 해줍니다.',choose:'껍질이 탄탄하고 윤기가 있으며 크기에 비해 묵직한 것을 살펴봅니다.',keep:'냉장 보관하면 수분과 향을 비교적 오래 유지하기 좋습니다.',enjoy:'음료·드레싱·디저트에 소량 더해 상큼한 향을 즐기세요.'},
    '금귤':{season:'겨울 · 봄',summary:'작은 크기 안에 향긋한 껍질과 상큼한 과즙이 함께 들어 있습니다.',choose:'색이 고르고 껍질이 탄탄하며 향이 선명한 것을 살펴봅니다.',keep:'씻지 않은 상태로 냉장 보관하고 드시기 직전에 세척하세요.',enjoy:'깨끗이 씻어 껍질째 즐기거나 차·디저트에 활용하기 좋습니다.'}
  };
  const allFruitNames=Object.keys(fruitMeta);
  const autoSeason=()=>{const m=new Date().getMonth()+1;return m>=3&&m<=5?'spring':m>=6&&m<=8?'summer':m>=9&&m<=11?'autumn':'winter'};
  const params=new URLSearchParams(location.search);
  const forced=params.get('season');
  const valid=['spring','summer','autumn','winter'];
  let seasonMode=valid.includes(forced)?forced:'auto';
  let current=seasonMode==='auto'?autoSeason():seasonMode;
  const artwork=$('#seasonArtwork'), visual=$('#seasonVisual');
  const seasonThemeColors={spring:'#fff5f3',summer:'#f3f8f0',autumn:'#fbf1e6',winter:'#f4f6f1'};
  function updateSeasonControls(){
    const data=seasons[current];
    root.dataset.season=current;
    document.documentElement.dataset.season=current;
    const metaTheme=document.querySelector('meta[name="theme-color"]'); if(metaTheme)metaTheme.setAttribute('content',seasonThemeColors[current]||'#fbf7f0');
    $$('[data-season-status]').forEach(el=>el.textContent=`${data.label}${seasonMode==='auto'?' · 자동':''}`);
    $$('[data-public-season]').forEach(btn=>btn.classList.toggle('is-active',btn.dataset.publicSeason===seasonMode));
  }
  function setSeasonMode(mode){
    seasonMode=valid.includes(mode)?mode:'auto';
    const u=new URL(location.href);
    if(seasonMode==='auto')u.searchParams.delete('season'); else u.searchParams.set('season',seasonMode);
    history.replaceState({},'',u.pathname+(u.searchParams.toString()?`?${u.searchParams.toString()}`:'')+u.hash);
    applySeason(seasonMode==='auto'?autoSeason():seasonMode);
  }
  function applySeason(key){
    current=key; visual.classList.add('is-changing');
    const data=seasons[key]; artwork.alt=`이룸 ${data.label} 계절 메인 시안`;
    const hc=heroCopy[key]||heroCopy.autumn;
    const ht=$('#heroSeasonTitle'),hd=$('#heroSeasonDesc'),hg=$('#heroSeasonTag');
    if(ht)ht.textContent=hc.title;
    if(hd)hd.innerHTML=hc.desc;
    if(hg)hg.textContent=hc.tag;
    updateSeasonControls();
    const preload=new Image();
    preload.onload=()=>{artwork.src=preload.src; requestAnimationFrame(()=>visual.classList.remove('is-changing'))};
    const heroUrl=assets+data.art;
    visual.style.setProperty('--hero-image', `url("${heroUrl}")`);
    preload.src=heroUrl;
    const ca=$('#curationArt'),ga=$('#giftArt'),pa=$('#premiumArt');
    if(ca)ca.src=assets+data.curation;if(ga)ga.src=assets+data.gift;if(pa)pa.src=assets+data.premium;
    $$('.premium-fruit-card:not(.seasonal-fruit-card)').forEach((card,i)=>{const n=(data.premiumFruits||[])[i],m=fruitMeta[n];if(!n||!m)return;card.dataset.fruit=n;const im=$('img',card),b=$('b',card),sm=$('small',card);if(im){im.src=assets+m[0];im.alt=n}if(b)b.textContent=n;if(sm)sm.textContent=m[1]});
    $$('.seasonal-fruit-card').forEach((card,i)=>{const n=(data.seasonalFruits||[])[i],m=fruitMeta[n];if(!n||!m)return;card.dataset.fruit=n;const im=$('img',card),b=$('b',card),sm=$('small',card);if(im){im.src=assets+m[0];im.alt=n}if(b)b.textContent=n;if(sm)sm.textContent=m[1]});
    $$('[data-season-label]').forEach(el=>el.textContent=data.label);
    $$('.library-card').forEach((card,i)=>{const n=(data.library||[])[i];const m=fruitMeta[n];if(!n||!m)return;card.dataset.fruit=n;const im=$('img',card),b=$('b',card),sm=$('small',card);if(im){im.src=assets+m[0];im.alt=n}if(b)b.textContent=n;if(sm)sm.textContent=m[1]});
  }
  applySeason(current);

  $('[data-home]')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

  const overlay=$('#modalBackdrop'), kicker=$('#modalKicker'), title=$('#modalTitle'), intro=$('#modalIntro'), body=$('#modalBody');
  let lastFocus=null;
  const setModal=(k,t,i,h)=>{kicker.textContent=k;title.textContent=t;intro.innerHTML=i||'';body.innerHTML=h||''};
  function openModal(type){
    lastFocus=document.activeElement;
    if(type==='seasonal')renderSeasonal();
    else if(type==='curation')renderCuration();
    else if(type==='gift')renderGift();
    else if(type==='brand')renderBrand();
    else if(type==='search')renderSearch();
    else if(type==='login')renderLogin();
    else if(type==='signup')renderSignup();
    else if(type==='mypage')renderMyPage();
    else if(type==='cart')renderCart();
    else if(type==='terms')renderTerms();
    else if(type==='privacy')renderPrivacy();
    else if(type==='guide')renderGuide();
    else if(type==='install')renderInstall();
    overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
    setTimeout(()=>$('button,select,input',overlay)?.focus(),20);
  }
  function closeModal(){overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');document.body.style.overflow='';try{lastFocus?.focus()}catch(e){}}
  function renderSeasonal(){
    const d=seasons[current];
    const cards=d.seasonalFruits.map(n=>{const m=fruitMeta[n]||['','오늘 상태가 좋은 과일'];return `<button class="fruit-card" type="button" data-fruit="${n}"><img src="${assets+m[0]}" alt="${n}"><span><b>${n}</b><small>${m[1]}</small></span></button>`}).join('');
    setModal('SEASONAL PICKS',`${d.label} 제철 과일 4선`,`지금 계절에 가장 맛이 좋은 과일 4가지를 골랐습니다. 과일을 누르면 상세설명을 확인할 수 있어요.`,`<div class="modal-grid">${cards}</div>`);
  }
  function renderCuration(){
    setModal('FRUIT CURATION','당신에게 맞는 과일을 골라드려요','예산 · 용도 · 취향만 알려주시면 그날 상태가 좋은 과일을 기준으로 추천합니다.',`
      <div class="modal-form">
        <div class="choice"><label>01 · BUDGET</label><select id="budget"><option>3만원 이하</option><option selected>3~5만원</option><option>5~8만원</option><option>8~12만원</option><option>12만원 이상</option></select></div>
        <div class="choice"><label>02 · PURPOSE</label><select id="purpose"><option>가정용</option><option selected>감사 선물</option><option>가족 · 건강 선물</option><option>기업 · 단체 선물</option></select></div>
        <div class="choice"><label>03 · TASTE</label><select id="taste"><option>아주 달콤하게</option><option selected>달콤하고 부드럽게</option><option>달콤·새콤 균형</option><option>상큼하게</option></select></div>
      </div>
      <div class="mini-panel" style="margin-top:18px"><p><b>이룸 추천 방식</b><br>많이 보여드리기보다 예산과 상황에 맞는 과일을 골라 구성합니다. 실제 상담 연결은 다음 기능 작업에서 이룸3 상담 시스템과 최종 연결합니다.</p></div>
      <div class="modal-actions"><button class="primary-btn" type="button" data-demo="curation">선택 내용 확인하기 →</button><button class="secondary-btn" type="button" data-close>닫기</button></div>`);
  }
  function renderGift(){
    setModal('GIFT SELECTION','좋은 마음을 전하는 과일 선물','과일보다 먼저 받는 분과 전하고 싶은 마음을 생각해 정성스럽게 구성합니다.',`
      <div class="gift-list">
        <button class="gift-option" type="button" data-demo="gift"><b>감사 선물</b><span>고마운 마음을 정갈하게 전하고 싶을 때</span></button>
        <button class="gift-option" type="button" data-demo="gift"><b>가족 · 건강 선물</b><span>여럿이 함께 즐기기 좋은 균형 구성</span></button>
        <button class="gift-option" type="button" data-demo="gift"><b>기업 · 단체 선물</b><span>예산 · 수량 · 포장 조건까지 맞춤 제안</span></button>
      </div>`);
  }
  function renderBrand(){
    setModal('BRAND STORY','이룸이 과일을 고르는 기준','화려한 설명보다 매일 지키는 기본을 중요하게 생각합니다.',`
      <div class="story-grid">
        <article class="story-card"><b>01 · SOURCE</b><h3>산지</h3><p>제철과 산지의 특성을 살펴 지금 맛이 좋은 과일을 선택합니다.</p></article>
        <article class="story-card"><b>02 · SELECT</b><h3>선별</h3><p>모양뿐 아니라 향 · 숙도 · 단단함과 용도를 함께 확인합니다.</p></article>
        <article class="story-card"><b>03 · PACK</b><h3>포장</h3><p>과일이 눌리거나 흔들리지 않도록 구성에 맞춰 정성스럽게 포장합니다.</p></article>
        <article class="story-card"><b>04 · DELIVERY</b><h3>배송</h3><p>받는 순간까지 좋은 상태가 이어지도록 주문과 배송 흐름을 관리합니다.</p></article>
      </div>`);
  }
  function renderSearch(){
    setModal('SEARCH','과일 찾기','과일 이름을 입력하면 빠르게 찾을 수 있습니다.',`<div class="search-row"><input id="searchInput" placeholder="예: 사과, 딸기, 샤인머스캣"><button type="button" data-search>검색</button></div><div class="search-results" id="searchResults"></div>`);
    setTimeout(()=>fillSearch(''),0);
  }
  function fillSearch(q){const box=$('#searchResults');if(!box)return;q=(q||'').trim();const list=allFruitNames.filter(n=>!q||n.includes(q));box.innerHTML=list.map(n=>`<button type="button" data-fruit="${n}">${n}</button>`).join('')||'<span style="color:#81786e">검색 결과가 없습니다.</span>'}
  function renderLogin(){
    setModal('MEMBER','LOGIN','이룸 회원 로그인과 신규 회원가입을 한 창에서 이용할 수 있습니다.',`
      <form class="auth-form" id="loginForm">
        <label><span>아이디 또는 이메일</span><input name="account" autocomplete="username" required placeholder="아이디 또는 이메일"></label>
        <label><span>비밀번호</span><input name="password" type="password" autocomplete="current-password" required placeholder="비밀번호"></label>
        <button class="primary-btn" type="submit">LOGIN</button>
        <button class="kakao-login-btn" type="button" data-kakao-login>KAKAO LOGIN</button>
        <div class="login-join-box"><span>처음 방문하셨나요?</span><button type="button" data-open-related="signup">SIGN UP · 회원가입</button></div>
      </form>`);
  }
  function renderSignup(){
    setModal('MEMBER JOIN','회원가입','기본 정보만 입력하면 이룸 회원으로 가입할 수 있습니다.',`
      <form class="auth-form auth-form-signup" id="signupForm">
        <div class="auth-grid">
          <label><span>아이디</span><input name="username" minlength="4" maxlength="20" autocomplete="username" required placeholder="영문·숫자 4~20자"></label>
          <label><span>이름</span><input name="name" autocomplete="name" required placeholder="이름"></label>
          <label><span>비밀번호</span><input name="password" type="password" minlength="6" autocomplete="new-password" required placeholder="6자 이상"></label>
          <label><span>이메일</span><input name="email" type="email" autocomplete="email" placeholder="선택 입력"></label>
          <label class="auth-grid-wide"><span>휴대폰</span><input name="phone" autocomplete="tel" placeholder="선택 입력"></label>
        </div>
        <button class="primary-btn" type="submit">회원가입</button>
        <button class="kakao-login-btn" type="button" data-kakao-login>카카오로 빠르게 가입·로그인</button>
        <p class="auth-help">이미 회원이신가요? <button type="button" data-open-related="login">로그인</button></p>
      </form>`);
  }
  function renderMyPage(){
    setModal('MY PAGE','마이페이지','로그인 상태와 회원 정보를 확인할 수 있습니다.',`
      <div class="login-status" id="myPageStatus"><b>로그인 상태를 확인하고 있습니다.</b><span>잠시만 기다려 주세요.</span></div>
      <div class="modal-actions"><button class="secondary-btn" type="button" data-logout>로그아웃</button></div>`);
    setTimeout(loadMyPageStatus,0);
  }
  function renderCart(){setModal('CART','장바구니','고른 상품과 선물 구성을 확인하는 창입니다.',`<div class="mini-panel"><p>현재는 디자인 베이스 단계입니다. 다음 작업에서 기존 이룸3 장바구니 데이터를 그대로 연결합니다.</p></div>`)}
  function renderTerms(){
    setModal('TERMS','이용약관','이룸 fresh fruits의 상품 주문과 서비스 이용에 관한 기본 안내입니다.',`
      <div class="mini-panel"><p><b>주문 · 결제</b><br>상품의 가격, 구성, 배송 가능 여부는 주문 시 표시되는 안내를 기준으로 합니다.</p></div>
      <div class="mini-panel" style="margin-top:12px"><p><b>배송 · 취소 · 환불</b><br>신선식품의 특성을 고려하여 상품 준비 전 취소 여부와 수령 후 상품 상태를 확인해 주세요. 개별 주문의 처리 기준은 관계 법령과 주문 안내를 따릅니다.</p></div>
      <div class="mini-panel" style="margin-top:12px"><p><b>고객 안내</b><br>세부 운영 기준은 관리자 설정과 주문 화면의 최신 안내를 우선 적용합니다.</p></div>`);
  }
  function renderPrivacy(){
    setModal('PRIVACY','개인정보처리방침','주문 · 배송 · 상담에 필요한 범위에서만 개인정보를 이용합니다.',`
      <div class="mini-panel"><p><b>수집 항목</b><br>이름, 연락처, 배송지, 주문 및 상담에 필요한 정보</p></div>
      <div class="mini-panel" style="margin-top:12px"><p><b>이용 목적</b><br>주문 처리, 배송, 고객 상담, 서비스 이용 확인</p></div>
      <div class="mini-panel" style="margin-top:12px"><p><b>보관 및 파기</b><br>관련 법령과 거래 보관 의무에 따른 기간 동안 보관한 뒤 안전하게 파기합니다.</p></div>`);
  }
  function renderGuide(){
    setModal('GUIDE','이용안내 · 가이드','이룸을 더 편하게 이용하는 방법을 간단히 안내합니다.',`
      <div class="story-grid">
        <article class="story-card"><b>01 · PREMIUM</b><h3>프리미엄 과일</h3><p>이룸이 품질과 상태를 기준으로 엄선한 과일을 확인하세요.</p></article><article class="story-card"><b>02 · SEASON</b><h3>제철 과일</h3><p>지금 계절에 특히 맛이 좋은 과일 4가지를 만나보세요.</p></article>
        <article class="story-card"><b>03 · CURATION</b><h3>맞춤 과일</h3><p>예산 · 용도 · 취향을 알려주시면 상황에 맞춰 구성합니다.</p></article>
        <article class="story-card"><b>04 · GIFT</b><h3>선물 제안</h3><p>감사, 가족, 기업 선물 등 목적에 맞는 구성을 제안합니다.</p></article>
        <article class="story-card"><b>05 · CONTACT</b><h3>BAND · 카카오</h3><p>하단 빠른 연결 버튼을 이용해 소식과 상담 채널로 이동할 수 있습니다.</p></article>
      </div>`);
  }
  let deferredInstallPrompt=null;
  const installStatus=()=>document.querySelector('[data-install-status]');
  const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone=()=>window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone===true;
  const isSecureInstallContext=()=>window.isSecureContext && (location.protocol==='https:' || ['localhost','127.0.0.1'].includes(location.hostname));
  function setInstallStatus(text){const el=installStatus();if(el)el.textContent=text}
  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault();
    deferredInstallPrompt=e;
    setInstallStatus('설치 준비 완료 · 눌러서 앱처럼 설치');
  });
  window.addEventListener('appinstalled',()=>{
    deferredInstallPrompt=null;
    setInstallStatus('설치 완료 · 홈 화면이나 바탕화면에서 실행');
  });
  function renderInstall(){
    const ios=isIOS(), standalone=isStandalone(), secure=isSecureInstallContext();
    const localFile=location.protocol==='file:';
    const state=standalone?'이미 앱 모드로 실행 중입니다.':localFile?'현재 파일을 직접 열어본 상태라 설치 기능을 사용할 수 없습니다.':secure?'설치 가능한 보안 환경에서 열려 있습니다.':'앱 설치는 HTTPS 주소 또는 localhost에서 사용할 수 있습니다.';
    setModal('INSTALL','이룸을 앱처럼 설치하기',state,`
      <div class="install-note">
        <div class="install-step"><b>Android · Chrome / Samsung Internet</b>이 페이지를 HTTPS로 연 뒤 ‘앱 설치’ 버튼을 누르세요. 설치 제안이 아직 준비되지 않았다면 브라우저 메뉴의 ‘홈 화면에 추가’ 또는 ‘앱 설치’를 이용할 수 있습니다.</div>
        <div class="install-step"><b>iPhone · Safari</b>Safari 하단의 공유 버튼 → ‘홈 화면에 추가’ → ‘추가’를 선택하세요. iOS는 웹사이트가 설치창을 자동으로 띄우는 방식을 지원하지 않습니다.</div>
        <div class="install-step"><b>Windows · Mac</b>Chrome 또는 Edge에서 HTTPS 주소를 열고 주소창의 설치 아이콘을 누르면 시작 메뉴·Dock·바탕화면에서 앱처럼 사용할 수 있습니다.</div>
        ${localFile?'<div class="install-step install-warning"><b>지금 확인하는 방법</b>압축파일의 <code>ROOT_루트에_업로드/START_앱설치_미리보기.bat</code>를 실행하면 localhost로 열려 설치 기능을 확인할 수 있습니다.</div>':''}
      </div>
      <div class="modal-actions"><button class="primary-btn" type="button" data-install-now>${standalone?'이미 설치됨':ios?'iPhone 설치 방법 확인':'지원되면 지금 설치'}</button><button class="secondary-btn" type="button" data-copy-home>홈페이지 주소 복사</button></div>`);
  }
  async function installApp(){
    if(isStandalone()){alert('이미 앱처럼 설치되어 실행 중입니다.');return}
    if(deferredInstallPrompt){
      try{
        deferredInstallPrompt.prompt();
        const r=await deferredInstallPrompt.userChoice;
        if(r?.outcome==='accepted')setInstallStatus('설치 진행 중');
      }catch(e){}
      deferredInstallPrompt=null;
      return;
    }
    openModal('install');
  }
  async function ensureKakaoSdk(){
    if(window.Kakao)return true;
    return new Promise(resolve=>{const s=document.createElement('script');s.src='https://t1.kakaocdn.net/kakao_js_sdk/2.8.3/kakao.min.js';s.onload=()=>resolve(true);s.onerror=()=>resolve(false);document.head.appendChild(s)});
  }
  async function startKakaoLogin(){
    if(!publicSite.kakaoEnabled||!publicSite.kakaoJsKey){alert('카카오 로그인은 관리자 설정에서 JavaScript 키를 등록하고 사용을 켜야 합니다.');return}
    const ok=await ensureKakaoSdk();if(!ok||!window.Kakao){alert('카카오 로그인 모듈을 불러오지 못했습니다.');return}
    try{if(!Kakao.isInitialized())Kakao.init(publicSite.kakaoJsKey);Kakao.Auth.authorize({redirectUri:publicSite.kakaoRedirectUri||`${location.origin}/api/auth/kakao/callback`})}catch(e){alert('카카오 로그인 설정을 확인해 주세요.')}
  }
  async function loadMyPageStatus(){
    const box=$('#myPageStatus');if(!box)return;
    try{
      const r=await fetch('/api/me',{cache:'no-store',credentials:'same-origin'});
      const d=await r.json();
      if(d.user){
        box.innerHTML=`<b>${d.user.name||d.user.username||'이룸 고객'}님, 반갑습니다.</b><span>${d.user.email||d.user.username||''}</span>`;
        return;
      }
    }catch(e){}
    box.innerHTML='<b>로그인이 필요합니다.</b><span>상단의 로그인·회원가입 또는 카카오 로그인을 이용해 주세요.</span><div class="login-status-actions"><button type="button" data-open-related="login">로그인</button><button type="button" data-open-related="signup">회원가입</button></div>';
  }
  async function updateHeaderAuth(){
    const wrap=$('.header-auth');if(!wrap)return;
    try{
      const r=await fetch('/api/me',{cache:'no-store',credentials:'same-origin'});
      const d=await r.json();
      if(d.user){
        const nm=(d.user.name||d.user.username||'회원').replace(/[<>]/g,'');
        wrap.innerHTML=`<button class="auth-link auth-user" type="button" data-modal="mypage">${nm}님</button><span aria-hidden="true">·</span><button class="auth-link" type="button" data-logout>LOGOUT</button>`;
        return;
      }
    }catch(e){}
    wrap.innerHTML='<button class="auth-link auth-login-only" type="button" data-modal="login">LOGIN</button>';
  }
  async function submitLogin(form){
    const fd=new FormData(form);
    const account=String(fd.get('account')||'').trim();
    const password=String(fd.get('password')||'');
    try{
      const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({username:account,password})});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||'로그인에 실패했습니다.');
      await updateHeaderAuth();closeModal();setTimeout(()=>openModal('mypage'),80);
    }catch(e){alert(e.message||'로그인 서버 연결을 확인해 주세요.')}
  }
  async function submitSignup(form){
    const fd=new FormData(form);
    const payload=Object.fromEntries(fd.entries());
    try{
      const r=await fetch('/api/signup',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(payload)});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||'회원가입에 실패했습니다.');
      await updateHeaderAuth();closeModal();setTimeout(()=>openModal('mypage'),80);
    }catch(e){alert(e.message||'회원가입 서버 연결을 확인해 주세요.')}
  }
  async function logoutUser(){
    try{await fetch('/api/logout',{method:'POST',credentials:'same-origin'})}catch(e){}
    await updateHeaderAuth();
    if(overlay.classList.contains('open')){closeModal();}
  }
  function openFruit(n){
    lastFocus=document.activeElement;
    showFruit(n);
    overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
    setTimeout(()=>$('button',overlay)?.focus(),20);
  }
  function showFruit(n){
    const m=fruitMeta[n]||['','오늘 상태가 좋은 과일'];
    const d=fruitDetails[n]||fruitDetails[fruitAliasBase[n]]||{season:'계절 추천',summary:m[1]||'오늘 상태가 좋은 과일입니다.',choose:'표면 상태와 향, 탄력과 무게를 함께 살펴 신선한 과일을 고릅니다.',keep:'과일의 숙도에 맞춰 실온 또는 냉장 보관해 주세요.',enjoy:'가장 맛있는 상태에서 신선하게 즐겨보세요.'};
    setModal('FRUIT DETAIL',n,`${m[1]} · ${d.season}`,`
      <div class="fruit-detail-layout">
        <div class="fruit-detail-visual"><img src="${assets+m[0]}" alt="${n}"></div>
        <div class="fruit-detail-summary">
          <span class="fruit-detail-badge">IROOM FRUIT GUIDE · ${d.season}</span>
          <h3>${n} 상세설명</h3>
          <p>${d.summary}</p>
          <div class="fruit-detail-grid">
            <div class="fruit-detail-item"><b>맛과 식감</b><span>${m[1]}</span></div>
            <div class="fruit-detail-item"><b>고르는 기준</b><span>${d.choose}</span></div>
            <div class="fruit-detail-item"><b>보관 방법</b><span>${d.keep}</span></div>
            <div class="fruit-detail-item"><b>맛있게 즐기기</b><span>${d.enjoy}</span></div>
          </div>
          <div class="fruit-detail-actions"><button class="primary" type="button" data-open-related="curation">이 과일로 맞춤 상담</button><button type="button" data-open-related="gift">선물 구성 보기</button></div>
        </div>
      </div>`)
  }

  function applyPublicConfig(data={}){
    publicSite={...PUBLIC_DEFAULT,...(data.site||data||{})};
    const bn=$('[data-business-no]'); if(bn)bn.textContent=publicSite.businessNo||PUBLIC_DEFAULT.businessNo;
    const mo=$('[data-mail-order]'); if(mo)mo.textContent=publicSite.mailOrderNo||PUBLIC_DEFAULT.mailOrderNo;
    const ad=$('[data-business-address]'); if(ad)ad.textContent=publicSite.address||PUBLIC_DEFAULT.address;
    const reviews=(data.reviews||[]).filter(r=>r.show!==false).slice(0,3);
    if(reviews.length){
      const cards=$$('.review-card');
      cards.forEach((card,i)=>{if(!reviews[i])return; const p=$('p',card),sm=$('small',card); if(p)p.textContent='“'+String(reviews[i].text||'').replace(/[“”]/g,'')+'”'; if(sm)sm.textContent=reviews[i].author||'이룸 고객';});
    }
  }
  async function loadPublicConfig(){
    let loaded=null;
    try{const r=await fetch('/api/site/footer-config',{cache:'no-store'});if(r.ok)loaded=await r.json()}catch(e){}
    if(!loaded){try{const x=JSON.parse(localStorage.getItem('iroom_admin_store_v60')||'null');if(x)loaded=x}catch(e){}}
    applyPublicConfig(loaded||{});
  }
  function openExternal(url){if(!url)return false; try{window.open(url,'_blank','noopener,noreferrer');return true}catch(e){location.href=url;return true}}
  async function shareSite(){
    const data={title:'이룸 fresh fruits',text:'좋은 과일로 마음을 전하는 이룸 fresh fruits',url:location.href};
    if(navigator.share){try{await navigator.share(data);return}catch(e){if(e?.name==='AbortError')return}}
    try{await navigator.clipboard.writeText(location.href);alert('홈페이지 주소를 복사했습니다.')}catch(e){prompt('아래 주소를 복사해 주세요.',location.href)}
  }
  loadPublicConfig();
  updateHeaderAuth();
  if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost' || location.hostname==='127.0.0.1')){
    window.addEventListener('load',async()=>{
      try{
        await navigator.serviceWorker.register('./sw.js',{scope:'./'});
        await navigator.serviceWorker.ready;
        if(isStandalone())setInstallStatus('설치 완료 · 앱 모드로 실행 중');
        else if(!deferredInstallPrompt)setInstallStatus('설치 기능 준비 중 · 브라우저 메뉴에서도 설치 가능');
      }catch(e){setInstallStatus('설치 설정을 확인해 주세요')}
    });
  }else if(location.protocol==='file:'){
    setInstallStatus('미리보기 파일 · 설치 확인은 localhost에서 가능');
  }
  if(new URLSearchParams(location.search).get('kakao')==='success')setTimeout(async()=>{history.replaceState({},'',location.pathname);await updateHeaderAuth();openModal('mypage')},180);

  root.addEventListener('click',e=>{
    const seasonBtn=e.target.closest('[data-public-season]'); if(seasonBtn){e.preventDefault();setSeasonMode(seasonBtn.dataset.publicSeason);return}
    const m=e.target.closest('[data-modal]'); if(m){e.preventDefault();openModal(m.dataset.modal);return}
    if(e.target.closest('[data-kakao-login]')){e.preventDefault();startKakaoLogin();return}
    if(e.target.closest('[data-logout]')){e.preventDefault();logoutUser();return}
    if(e.target.closest('[data-install-app]')){e.preventDefault();installApp();return}
    const fruit=e.target.closest('[data-fruit]');
    if(fruit){e.preventDefault();openFruit(fruit.dataset.fruit);return}
    const social=e.target.closest('[data-social]');
    if(social){
      e.preventDefault();
      const kind=social.dataset.social;
      if(kind==='share'){shareSite();return}
      if(kind==='band'){if(!openExternal(publicSite.bandUrl))alert('관리자 설정에서 BAND 주소를 입력해 주세요.');return}
    }
  });
  overlay.addEventListener('click',e=>{
    if(e.target===overlay||e.target.closest('[data-close]')){closeModal();return}
    const f=e.target.closest('[data-fruit]'); if(f){showFruit(f.dataset.fruit);return}
    if(e.target.closest('[data-search]')){fillSearch($('#searchInput')?.value||'');return}
    if(e.target.closest('[data-kakao-login]')){startKakaoLogin();return}
    if(e.target.closest('[data-logout]')){logoutUser();return}
    if(e.target.closest('[data-install-now]')){if(deferredInstallPrompt){installApp();}return}
    if(e.target.closest('[data-copy-home]')){navigator.clipboard?.writeText(location.origin).then(()=>alert('홈페이지 주소를 복사했습니다.')).catch(()=>prompt('주소를 복사해 주세요.',location.origin));return}
    const related=e.target.closest('[data-open-related]'); if(related){openModal(related.dataset.openRelated);return}
    const demo=e.target.closest('[data-demo]'); if(demo){const box=demo.closest('.modal-panel'); if(box){demo.textContent='다음 기능 작업에서 이룸3 시스템과 연결';demo.disabled=true;setTimeout(()=>{demo.disabled=false;demo.textContent=demo.dataset.demo==='curation'?'선택 내용 확인하기 →':'상담 연결 예정'},1700)} }
  });
  overlay.addEventListener('submit',e=>{
    if(e.target.id==='loginForm'){e.preventDefault();submitLogin(e.target);return}
    if(e.target.id==='signupForm'){e.preventDefault();submitSignup(e.target);return}
  });
  overlay.addEventListener('input',e=>{if(e.target.id==='searchInput')fillSearch(e.target.value)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('open'))closeModal()});
})();
