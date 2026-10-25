// script banner 300x250

            LottieInteractivity.create({
            player: '#hoverPlayer',
            mode: 'chain',
            actions: [
                {
                    state: 'none',
                    transition: 'hold',
                    frames: [0, 65]
                },
                {
                    state: 'autoplay',
                    frames: [65, 300],
                    transition: 'onComplete',
                },
                {
                    state: 'none',
                    transition: 'hold',
                    frames: [299, 301]
                },
                {
                    state: 'autoplay',
                    frames: [302, 312],
                    transition: 'onComplete',
                },
                {
                    state: 'autoplay',
                    frames: [312, 326],
                    transition: 'click',
                    reset: true
                }
            ]
            });


// script banner 900x250

            LottieInteractivity.create({
            player: '#hoverPlayer970',
            mode: 'chain',
            actions: [
                {
                    state: 'none',
                    transition: 'hold',
                    frames: [0, 65]
                },
                {
                    state: 'autoplay',
                    frames: [65, 300],
                    transition: 'onComplete',
                },
                {
                    state: 'none',
                    transition: 'hold',
                    frames: [299, 301]
                },
                {
                    state: 'autoplay',
                    frames: [302, 312],
                    transition: 'onComplete',
                },
                {
                    state: 'autoplay',
                    frames: [312, 326],
                    transition: 'click',
                    reset: true
                }
            ]
            });


// script banner mobile


            LottieInteractivity.create({
            mode:"scroll",
            player: '#hoverPlayermobile',
            actions: [
                {
                    visibility:[0.3,0.7],
                    type: "seek",
                    frames: [0, 326],
                },
            ]
            });
