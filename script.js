(function () {
  'use strict';

  const SEQUENCES = {

    'onboarding': [
      { lines: [
        { text: "Ahh… there you are." },
        { text: "I was wondering when you'd arrive." },
        { text: "Come in, come in. Mind the scraps on the floor—this old place has a habit of making things when no one's looking." }
      ]},
      { lines: [
        { text: "This is a workshop of small favours and quiet craft." },
        { text: "Folks from all around come here when they need something made." },
        { text: "They bring ideas, feelings, little problems…" },
        { text: "And we make something real to help." }
      ]},
      { lines: [
        { text: "But here's the important part, apprentice…" },
        { text: "We don't just pretend to make things here." },
        { text: "You'll be making them with your own hands." }
      ]},
      { lines: [
        { text: "Paper, string, scraps, whatever you have nearby." },
        { text: "No need for anything fancy." }
      ]},
      { lines: [
        { text: "Each visitor will ask for something different." },
        { text: "A bit of color… a soft texture… a sturdy shape…" },
        { text: "But you should only take a job if you've got the materials for it." }
      ]},
      { lines: [
        { text: "If you've only got paper, take a paper task." },
        { text: "If you've got fabric, take a soft task." },
        { text: "There's no rush. No one here keeps score." }
      ]},
      { lines: [
        { text: "And when you've finished…" },
        { text: "Bring it back here." },
        { text: "Take a picture of your creation, and we'll keep it safe in the order book." },
        { text: "A record of everything you've made." }
      ]},
      { lines: [
        { text: "Every little help you've given." }
      ]},
      { lines: [
        { text: "The visitors… They're quite special." },
        { text: "Each one knows their craft better than I ever did." }
      ]},
      { lines: [
        { text: "One might teach you about color…" },
        { text: "Another about texture…" },
        { text: "Another about building something that stands strong." }
      ]},
      { lines: [
        { text: "All you have to do is listen while you make." }
      ]},
      { lines: [
        { text: "There's no such thing as 'wrong' here." },
        { text: "Only… made." },
        { text: "And that's always something to be proud of." }
      ]},
      { lines: [
        { text: "Now then…" },
        { text: "Let's see who needs help today, hm?" }
      ], isExit: true }
    ],

    'hugh-lesson': [
      { lines: [
        { text: "Oh hello there, you must be the new apprentice." },
        { text: "I'm Hugh." }
      ]},
      { lines: [
        { text: "My window broke in the storm last night…" },
        { text: "It used to catch the light so beautifully." },
        { text: "Now everything feels a bit… flat." }
      ]},
      { lines: [
        { text: "Do you know stained glass?", popup: 'stained-glass-examples' },
        { text: "It's a window made of little pieces of colored glass…" },
        { text: "All fit together like a puzzle." }
      ]},
      { lines: [
        { text: "When the light shines through…" },
        { text: "it paints the whole room.", popup: 'dismiss' }
      ]},
      { lines: [
        { text: "I don't need anything too fancy…" },
        { text: "Just a window shape you like." },
        { text: "Round, tall, wiggly—whatever feels right to you." },
        { text: "As long as the colors can shine through." }
      ]},
      { lines: [
        { text: "Colors can be quite particular, you see." },
        { text: "Some like to sit quietly together…" },
        { text: "And some like to stand out.", popup: 'colour-wheel' }
      ]},
      { lines: [
        { text: "Colors that sit across from each other…" },
        { text: "Like red and green…", popup: 'colour-wheel-red-green' },
        { text: "Or blue and orange…", popup: 'colour-wheel-blue-orange' }
      ]},
      { lines: [
        { text: "They're called complementary colors." },
        { text: "They make each other brighter." },
        { text: "Like best friends who help each other shine.", popup: 'dismiss' }
      ]},
      { lines: [
        { text: "Colors don't just look nice…" },
        { text: "They feel like something." }
      ]},
      { lines: [
        { text: "Yellows can feel warm and happy…", popup: 'colour-mood-yellow' }
      ]},
      { lines: [
        { text: "Blues can feel calm… or a little quiet…", popup: 'colour-mood-blue' }
      ]},
      { lines: [
        { text: "And darker colors can feel mysterious.", popup: 'colour-mood-grey' }
      ]},
      { lines: [
        { text: "What do you want the light to feel like?", popup: 'dismiss' },
        { text: "Bright and cheerful?" },
        { text: "Soft and calm?" },
        { text: "Or something else entirely?" }
      ]},
      { lines: [
        { text: "Could you make me a stained glass window?" },
        { text: "Use colors that you think will shine together…" },
        { text: "Or ones that feel just right to you." }
      ], isExit: true }
    ],

    'hugh-reaction': [
      { lines: [
        { text: "Oh…!" },
        { text: "It's beautiful…" },
        { text: "It feels like the light is alive again." },
        { text: "Thank you apprentice!" }
      ], isExit: true }
    ],

    'puff-lesson': [
      { lines: [
        { text: "Hello there… are you the new apprentice?" },
        { text: "I'm Puff." }
      ]},
      { lines: [
        { text: "I lost my scarf during yesterday's cold wind…" },
        { text: "It was so soft in all the right places" },
        { text: "And so nice to look at!" }
      ]},
      { lines: [
        { text: "Do you know what I mean by texture?" },
        { text: "It's how something feels when you touch it." }
      ]},
      { lines: [
        { text: "Soft…", popup: 'texture-soft' },
        { text: "Rough…", popup: 'texture-rough' },
        { text: "Smooth…", popup: 'texture-smooth' },
        { text: "Or a little bumpy.", popup: 'texture-bumpy' }
      ]},
      { lines: [
        { text: "Certain things are soft…", popup: 'dismiss' },
        { text: "…and some things are scratchy." }
      ]},
      { lines: [
        { text: "They feel very different." },
        { text: "And that difference matters." }
      ]},
      { lines: [
        { text: "Soft textures feel safe…" },
        { text: "Scratchy ones feel uncomfortable…" },
        { text: "But sometimes…" },
        { text: "…a mix can still work if it's done carefully." }
      ]},
      { lines: [
        { text: "Could you make me a new scarf?" },
        { text: "You can use any materials you have…" },
        { text: "Felt… yarn… fabric… anything soft or interesting." },
        { text: "Try mixing textures… and see what feels right." }
      ], isExit: true }
    ],

    'puff-reaction': [
      { lines: [
        { text: "This feels much better." },
        { text: "It doesn't scratch anymore…" },
        { text: "And it feels warm all the way through!" }
      ], isExit: true }
    ],

    'rowan-lesson': [
      { lines: [
        { text: "Ah… you must be the apprentice." },
        { text: "This place is still standing… good. That means you understand care." }
      ]},
      { lines: [
        { text: "I'm Rowan." },
        { text: "My home was knocked loose in the wind last night." },
        { text: "It didn't fall far…" },
        { text: "But it no longer feels… secure." }
      ]},
      { lines: [
        { text: "Do you know what form is?" },
        { text: "It's the shape something has…", popup: 'form-2d-square' },
        { text: "Not just flat like paper…", popup: 'form-3d-cube' },
        { text: "But something with depth." },
        { text: "Something you can build around." }
      ]},
      { lines: [
        { text: "When shapes come together…" },
        { text: "They can become something you can hold space inside." },
        { text: "That is called volume.", popup: 'form-cube-sway' }
      ]},
      { lines: [
        { text: "This has volume…" },
        { text: "…but it's not stable yet." }
      ]},
      { lines: [
        { text: "But form alone is not enough." },
        { text: "What matters is how it holds together." },
        { text: "If something is too weak…" }
      ]},
      { lines: [
        { text: "It will fall apart." },
        { text: "If it is balanced…" },
        { text: "It stays strong." }
      ]},
      { lines: [
        { text: "Strong structures usually need a few things…" },
        { text: "Pieces that support each other…", popup: 'form-reinforced' },
        { text: "Balanced sides…", popup: 'form-reinforced-roof' },
        { text: "And a base that can hold weight…", popup: 'form-reinforced-base' }
      ]},
      { lines: [
        { text: "Like trees in the wind…", popup: 'dismiss' },
        { text: "They bend…" },
        { text: "But they do not break easily." }
      ]},
      { lines: [
        { text: "Could you rebuild this birdhouse?" },
        { text: "You can use wood pieces…" },
        { text: "sticks… or anything you have." }
      ]},
      { lines: [
        { text: "Try to make it strong enough to hold its shape…" },
        { text: "So a small bird could rest inside safely." }
      ], isExit: true }
    ],

    'rowan-reaction': [
      { lines: [
        { text: "…Yes." },
        { text: "It holds." },
        { text: "It feels steady… safe." },
        { text: "That is good form." },
        { text: "Thank you." }
      ], isExit: true }
    ],

    'final-closing': [
      { lines: [
        { text: "Well then, apprentice…" },
        { text: "You've helped everyone who came through today." },
        { text: "Every order filled. Every visitor happy." }
      ]},
      { lines: [
        { text: "Your order book is full of lovely things." },
        { text: "Each one made by your own hands." }
      ]},
      { lines: [
        { text: "That's something to be proud of." },
        { text: "Well done." }
      ], isExit: true }
    ]

  };

  window.SEQUENCES = SEQUENCES;
})();
