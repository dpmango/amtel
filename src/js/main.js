$(document).ready(function () {
  //////////
  // Global variables
  //////////

  var _window = $(window);
  var _document = $(document);

  // BREAKPOINT SETTINGS
  var bp = {
    mobileS: 375,
    mobile: 568,
    tablet: 768,
    desktop: 992,
    wide: 1336,
    hd: 1680
  }

  var easingSwing = [.02, .01, .47, 1]; // default jQuery easing for anime.js

  ////////////
  // READY - triggered when PJAX DONE
  ////////////
  function pageReady() {
    legacySupport();
    updateHeaderActiveClass();
    initHeaderScroll();

    initPopups();
    initSliders();
    initScrollMonitor();
    initMasks();
    initLazyLoad();
    initMap();
    initMenumaker();
    initSelectric();

    initCalc();

    // development helper
    _window.on('resize', debounce(setBreakpoint, 200))
  }

  // this is a master function which should have all functionality
  pageReady();


  // some plugins work best with onload triggers
  _window.on('load', function () {
    // your functions
  })

  //////////
  // COMMON
  //////////

  function legacySupport() {
    // svg support for laggy browsers
    svg4everybody();

    // Viewport units buggyfill
    window.viewportUnitsBuggyfill.init({
      force: false,
      refreshDebounceWait: 150,
      appendToBody: true
    });
  }


  // CLICK HANDLERS
  _document
    .on('click', '[href="#"]', function (e) {
      e.preventDefault();
    })
    .on('click', 'a[href^="#section"]', function () { // section scroll
      var el = $(this).attr('href');
      $('body, html').animate({
        scrollTop: $(el).offset().top
      }, 1000);
      return false;
    })
    .on('click', '.radio-item label', function () {
      $(this).parent().parent().find('.check__item').removeClass('is-active');
      $(this).parent().addClass('is-active');
    })
    .on('click', 'ul.main-nav li a', function () {
      $(this).parent().toggleClass('is-open');
    })
    .on('click', '.checkbox label', function () {
      $(this).toggleClass('is-checked');
    })
    .on('click', '#search-input', function () {
      $(this).parents('.header__form').addClass('is-open');
    })
    .on('mouseleave', 'header', function () {
      $('.header__form').removeClass('is-open');
    })

  // HEADER SCROLL
  // add .header-static for .page or body
  // to disable sticky header
  function initHeaderScroll() {
    _window.on('scroll', throttle(function (e) {
      var vScroll = _window.scrollTop();
      var header = $('.header').not('.header--static');
      var headerHeight = header.height();
      var firstSection = _document.find('.page__content div:first-child()').height() - headerHeight;
      var visibleWhen = Math.round(_document.height() / _window.height()) > 2.5

      if (visibleWhen) {
        if (vScroll > headerHeight) {
          header.addClass('is-fixed');
        } else {
          header.removeClass('is-fixed');
        }
        if (vScroll > firstSection) {
          header.addClass('is-fixed-visible');
        } else {
          header.removeClass('is-fixed-visible');
        }
      }
    }, 10));
  }


  // HAMBURGER TOGGLER
  _document.on('click', '[js-hamburger]', function () {
    $(this).toggleClass('is-active');
    $('nav').toggleClass('is-open');
  });

  function closeMobileMenu() {
    $('[js-hamburger]').removeClass('is-active');
    $('.mobile-navi').removeClass('is-active');
  }

  // SET ACTIVE CLASS IN HEADER
  // * could be removed in production and server side rendering when header is inside barba-container
  function updateHeaderActiveClass() {
    $('.header__menu li').each(function (i, val) {
      if ($(val).find('a').attr('href') == window.location.pathname.split('/').pop()) {
        $(val).addClass('is-active');
      } else {
        $(val).removeClass('is-active')
      }
    });
  }


  //////////
  // SLIDERS
  //////////
  function initCalc(){
    _document
      .on('click', '.checkbox-item label', function () {
        $(this).parent().toggleClass('is-active');
      });

    (function () {
      var $cbs = $('input[price]');

      function calcUsage() {
        var total = 0;
        $cbs.each(function () {
          if ($(this).is(":checked"))
            total = parseFloat(total) + parseFloat($(this).val());
        });
        $("#pay_price").text(total + ' ₽');
        $("#pay_price2").text(total + ' ₽');
      }

      $cbs.click(function () {
        calcUsage();
      });

      calcUsage();
    }());

    // CHANGES START FROM HERE <<<
    var $settingsForm = $('#settingsForm');
    var $settingsHeader = $settingsForm.find('.settings-header');
    var $settingsBody = $settingsForm.find('.settings-value');
    var $settingsOptions = $settingsForm.find('.settings-options');

    // settings object
    var formSettings = {
      moduleType: {
        id: 0,
        name: '',
      },
      modulteComplex: {
        id: 0,
        value: '',
      },
      modulteTranslator: {
        id: 0,
        value: '',
      },
      options: [],
    };

    // Form functional
    (function () {
      // Product type
      (function () {
        var $productTypeRadio = $('.product-type');

        $productTypeRadio.change(function () {
          var $self = $(this);
          var productName = $self.data('product-name');
          var productValue = $self.val();
          var productID = $self.attr('id');

          $self.parent().siblings().removeClass('is-active');
          $self.parent().addClass('is-active');

          $($settingsHeader.children()[0]).find('p').html(productName);
          $($settingsBody.children()[0]).find('p').html(productValue + ' ₽');
        });
      }());

      // Product complex
      (function () {
        var $productTypeRadio = $('.product-complex');

        $productTypeRadio.change(function () {
          var $self = $(this);
          var productName = $self.data('product-name');
          var productValue = $self.val();
          var productID = $self.attr('id');

          $self.parent().siblings().removeClass('is-active');
          $self.parent().addClass('is-active');

          $($settingsHeader.children()[1]).find('p').html(productName);
          $($settingsBody.children()[1]).find('p').html(productValue + ' ₽');
        });
      }());

      // Product complex
      (function () {
        var $productTypeRadio = $('.product-translator');

        $productTypeRadio.change(function () {
          var $self = $(this);
          var productName = $self.data('product-name');
          var productValue = $self.val();
          var productID = $self.attr('id');

          $self.parent().siblings().removeClass('is-active');
          $self.parent().addClass('is-active');

          $($settingsHeader.children()[2]).find('p').html(productName);
          $($settingsBody.children()[2]).find('p').html(productValue + ' ₽');
        });
      }());

      // Product option
      (function () {
        var $productTypeCheckbox = $('.product-option');

        $productTypeCheckbox.change(function () {
          var $self = $(this);
          var productName = $self.data('product-name');
          var productValue = $self.val();
          var productID = $self.attr('id');

          if ($self.prop('checked') === true) {
            var newOption = '<p class="g-check" data-option-id="' + productID + '">' + productName + '</p>'

            formSettings.options.push(productID);
            $settingsOptions.html($settingsOptions.html() + newOption);
          } else {
            $settingsOptions.find('[data-option-id="' + productID + '"]').remove();

            if (formSettings.options.indexOf(productID) >= 0) formSettings.options.splice(formSettings.options.indexOf(productID), 1)
          }
          console.log(formSettings.options);

          if (!formSettings.options.length) {
            $settingsOptions.find('.g-check.empty').css('display', 'block');
          } else {
            $settingsOptions.find('.g-check.empty').css('display', 'none');
          }
        });
      }());
    }());

  }

  //////////
  // SLIDERS
  //////////
  function initSliders() {

    $('.main-slider').slick({
      dots: false,
      infinite: true,
      autoplay: true,
      autoplaySpeed: 4000,
      speed: 300,
      slidesToShow: 1,
      adaptiveHeight: true,
      responsive: [{
        breakpoint: 568,
        settings: {
          arrows: false
        }
      }]
    })

  }

  //////////
  // MODALS
  //////////

  function initPopups() {
    // Magnific Popup
    var startWindowScroll = 0;
    $('.open-popup').magnificPopup({
      type: 'inline',
      fixedContentPos: true,
      fixedBgPos: true,
      overflowY: 'auto',
      closeBtnInside: true,
      preloader: false,
      midClick: true,
      removalDelay: 300,
      mainClass: 'popup-buble',
      callbacks: {
        beforeOpen: function () {
          startWindowScroll = _window.scrollTop();
          this.st.mainClass = this.st.el.attr('data-effect');
          // $('html').addClass('mfp-helper');
        },
        close: function () {
          // $('html').removeClass('mfp-helper');
          _window.scrollTop(startWindowScroll);
        }
      }
    });

    $('[js-popup-gallery]').magnificPopup({
      delegate: 'a',
      type: 'image',
      tLoading: 'Загрузка #%curr%...',
      mainClass: 'popup-buble',
      gallery: {
        enabled: true,
        navigateByImgClick: true,
        preload: [0, 1]
      },
      image: {
        tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
      }
    });
  }

  function closeMfp() {
    $.magnificPopup.close();
  }


  ////////////
  // MENUMAKER
  ////////////
  function initMenumaker(){

    if ( $("#cssmenu").length > 0 ){
      $("#cssmenu").menumaker({
        title: "Menu",
        format: "multitoggle"
      });
    }

    $.fn.menumaker = function (options) {

      var cssmenu = $(this),
        settings = $.extend({
          title: "Menu",
          format: "dropdown",
          sticky: false
        }, options);

      return this.each(function () {
        cssmenu.prepend('<div id="menu-button">' + settings.title + '</div>');
        $(this).find("#menu-button").on('click', function () {
          $(this).toggleClass('menu-opened');
          var mainmenu = $(this).next('ul');
          if (mainmenu.hasClass('open')) {
            mainmenu.hide().removeClass('open');
          } else {
            mainmenu.show().addClass('open');
            if (settings.format === "dropdown") {
              mainmenu.find('ul').show();
            }
          }
        });

        cssmenu.find('li ul').parent().addClass('has-sub');

        multiTg = function () {
          cssmenu.find(".has-sub").prepend('<span class="submenu-button"></span>');
          cssmenu.find('.submenu-button').on('click', function () {
            $(this).toggleClass('submenu-opened');
            if ($(this).siblings('ul').hasClass('open')) {
              $(this).siblings('ul').removeClass('open').hide();
            } else {
              $(this).siblings('ul').addClass('open').show();
            }
          });
        };

        if (settings.format === 'multitoggle') multiTg();
        else cssmenu.addClass('dropdown');

        if (settings.sticky === true) cssmenu.css('position', 'fixed');

        resizeFix = function () {
          if ($(window).width() > 768) {
            cssmenu.find('ul').show();
          }

          if ($(window).width() <= 768) {
            cssmenu.find('ul').hide().removeClass('open');
          }
        };
        resizeFix();
        return $(window).on('resize', resizeFix);

      });
    };
  }

  ////////////
  // SELECTRIC
  ////////////
  function initSelectric(){
    $('select').selectric();


    _document.on('click', '.selectricItems ul li', function(e) {
        e.preventDefault();
        var $self = $(this),
            tabIndex = $self.index();
        $self.siblings().removeClass('active');
        $self.addClass('active');
        $('.contract__item').removeClass('active').eq(tabIndex).addClass('active');
    });

  }


  ////////////
  // UI
  ////////////

  // textarea autoExpand
  _document
    .one('focus.autoExpand', '.ui-group textarea', function () {
      var savedValue = this.value;
      this.value = '';
      this.baseScrollHeight = this.scrollHeight;
      this.value = savedValue;
    })
    .on('input.autoExpand', '.ui-group textarea', function () {
      var minRows = this.getAttribute('data-min-rows') | 0,
        rows;
      this.rows = minRows;
      rows = Math.ceil((this.scrollHeight - this.baseScrollHeight) / 17);
      this.rows = minRows + rows;
    });

  // Masked input
  function initMasks() {
    $("[js-dateMask]").mask("99.99.99", {
      placeholder: "ДД.ММ.ГГ"
    });
    $("input[type='tel']").mask("+7 (000) 000-0000", {
      placeholder: "+7 (___) ___-____"
    });
  }


  ////////////
  // SCROLLMONITOR - WOW LIKE
  ////////////
  function initScrollMonitor() {
    $('.wow').each(function (i, el) {

      var elWatcher = scrollMonitor.create($(el));

      var delay;
      if ($(window).width() < 768) {
        delay = 0
      } else {
        delay = $(el).data('animation-delay');
      }

      var animationClass = $(el).data('animation-class') || "wowFadeUp"

      var animationName = $(el).data('animation-name') || "wowFade"

      elWatcher.enterViewport(throttle(function () {
        $(el).addClass(animationClass);
        $(el).css({
          'animation-name': animationName,
          'animation-delay': delay,
          'visibility': 'visible'
        });
      }, 100, {
          'leading': true
        }));
      // elWatcher.exitViewport(throttle(function () {
      //   $(el).removeClass(animationClass);
      //   $(el).css({
      //     'animation-name': 'none',
      //     'animation-delay': 0,
      //     'visibility': 'hidden'
      //   });
      // }, 100));
    });

  }


  //////////
  // LAZY LOAD
  //////////
  function initLazyLoad() {
    _document.find('[js-lazy]').Lazy({
      threshold: 500,
      enableThrottle: true,
      throttle: 100,
      scrollDirection: 'vertical',
      effect: 'fadeIn',
      effectTime: 350,
      // visibleOnly: true,
      // placeholder: "data:image/gif;base64,R0lGODlhEALAPQAPzl5uLr9Nrl8e7...",
      onError: function (element) {
        console.log('error loading ' + element.data('src'));
      },
      beforeLoad: function (element) {
        // element.attr('style', '')
      }
    });
  }

  //////////
  // BARBA PJAX
  //////////

  Barba.Pjax.Dom.containerClass = "page";

  var FadeTransition = Barba.BaseTransition.extend({
    start: function () {
      Promise
        .all([this.newContainerLoading, this.fadeOut()])
        .then(this.fadeIn.bind(this));
    },

    fadeOut: function () {
      var deferred = Barba.Utils.deferred();

      anime({
        targets: this.oldContainer,
        opacity: .5,
        easing: easingSwing, // swing
        duration: 300,
        complete: function (anim) {
          deferred.resolve();
        }
      })

      return deferred.promise
    },

    fadeIn: function () {
      var _this = this;
      var $el = $(this.newContainer);

      $(this.oldContainer).hide();

      $el.css({
        visibility: 'visible',
        opacity: .5
      });

      anime({
        targets: "html, body",
        scrollTop: 0,
        easing: easingSwing, // swing
        duration: 150
      });

      anime({
        targets: this.newContainer,
        opacity: 1,
        easing: easingSwing, // swing
        duration: 300,
        complete: function (anim) {
          triggerBody()
          _this.done();
        }
      });
    }
  });

  // set barba transition
  Barba.Pjax.getTransition = function () {
    return FadeTransition;
  };

  Barba.Prefetch.init();
  Barba.Pjax.start();

  Barba.Dispatcher.on('newPageReady', function (currentStatus, oldStatus, container, newPageRawHTML) {

    pageReady();
    closeMobileMenu();

  });

  // some plugins get bindings onNewPage only that way
  function triggerBody() {
    $(window).scroll();
    $(window).resize();
  }

  //////////
  // MAP
  //////////
  function initMap(){
    if ($('#map').length) {

      ymaps.ready(function () {
        var myMap = new ymaps.Map('map', {
          center: [55.809844, 37.513380],
          zoom: 17
        }, {
            searchControlProvider: 'yandex#search'
          }),

          // Создаём макет содержимого.
          MyIconContentLayout = ymaps.templateLayoutFactory.createClass(
            '<div style="color: #FFFFFF; font-weight: bold;">$[properties.iconContent]</div>'
          ),

          myPlacemark = new ymaps.Placemark([55.809844, 37.513380], {
          }, {
              // Необходимо указать данный тип макета.
              iconLayout: 'default#image',
              iconImageHref: 'img/map.svg',
              iconImageSize: [273, 143],
              // Смещение левого верхнего угла иконки относительно
              // её "ножки" (точки привязки).
              iconImageOffset: [-150, -50]
            });

        myMap.geoObjects
          .add(myPlacemark)
      });
    }
  };


  //////////
  // DEVELOPMENT HELPER
  //////////
  function setBreakpoint() {
    var wHost = window.location.host.toLowerCase()
    var displayCondition = wHost.indexOf("localhost") >= 0 || wHost.indexOf("surge") >= 0
    if (displayCondition) {
      console.log(displayCondition)
      var wWidth = _window.width();

      var content = "<div class='dev-bp-debug'>" + wWidth + "</div>";

      $('.page').append(content);
      setTimeout(function () {
        $('.dev-bp-debug').fadeOut();
      }, 1000);
      setTimeout(function () {
        $('.dev-bp-debug').remove();
      }, 1500)
    }
  }

});
