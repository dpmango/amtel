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
    initSelectric();
    initValidate();

    initCalc();

    // development helper
    _window.on('resize', debounce(setBreakpoint, 200))
  }

  // this is a master function which should have all functionality
  pageReady();

  revealFooter();
  _window.on('resize', debounce(revealFooter, 200));


  // some plugins work best with onload triggers
  _window.on('load', function () {
    // your functions
  })

  //////////
  // COMMON
  //////////
  function msieversion() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      return true
    } else {
      return false
    }
  }

  if ( msieversion() ){
    $('body').addClass('is-ie');
  }

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
    // radio
    .on('click', '.radio-item label', function () {
      $(this).parent().parent().find('.check__item').removeClass('is-active');
      $(this).parent().addClass('is-active');
    })
    // checkox
    .on('click', '.type-item label', function () {
      // $(this).parent().parent().find('.check__item').removeClass('is-active');
      $(this).parent().toggleClass('is-active');
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


  // FOOTER REVEAL
  function revealFooter() {
    var footer = _document.find('[js-reveal-footer]');
    if (footer.length > 0) {
      var footerHeight = footer.outerHeight();
      var maxHeight = _window.height() - footerHeight > 100;
      if (maxHeight && !msieversion() ) {
        $('body').css({
          'margin-bottom': footerHeight
        });
        footer.css({
          'position': 'fixed',
          'z-index': -10
        });
      } else {
        $('body').css({
          'margin-bottom': 0
        });
        footer.css({
          'position': 'static',
          'z-index': 10
        });
      }
    }
  }

  //////////
  // CALC
  //////////
  _document
    .on('click', '.checkbox-item label', function () {
      $(this).parent().toggleClass('is-active');
    });

  function initCalc(){
    // PRODUCTS
    var form = $('[js-products-form]');
    var typeInputs = form.find('input[name="type"]');
    var chooseProductsContainer = $('[js-choose-products]');
    var productsSelect = chooseProductsContainer.find('select');
    var chooseTarifsContainer = $('[js-choose-tarif]');
    var tarifSelect = chooseTarifsContainer.find('select');
    var availableTarifs = {};
    var selectedTarif = {};
    var calcOptionsContainer = $('[js-choose-options]');
    var calcTableContainer = $('[js-calc-table]');
    var calcCtaContainer = $('[js-calc-cta]');

    // select type of product
    typeInputs.on('change', function(e){
      // get id's for type
      var selectedTypeId = [];
      typeInputs.each(function(i,type){
        if ( $(type).is(':checked') ){
          selectedTypeId.push($(type).val());
        }
      });

      // get response with products available
      $.ajax({
        'url': '/json/getProducts.json',
        'data': {
          'typeId': selectedTypeId
        },
        'method': 'GET',
        'success': function(res){
          setProducts(res);
        }
      })
    })
    // select specific product
    productsSelect.on('change', function(e){
      $.ajax({
        'url': '/json/getTarifs.json',
        'data': {
          'productId': productsSelect.val()
        },
        'method': 'GET',
        'success': function(res){
          setTarifs(res);
          availableTarifs = res.tarifs // store all tarifs to get data leter
        }
      })
    })

    // select specific tarif
    tarifSelect.on('change', function(e){
      var currentVal = $(this).val();
      $.each(availableTarifs, function(i, tarif){
        if ( tarif.id == currentVal ){
          selectedTarif = tarif // find selected tarrif
          displayOptions(); // and show containers
        }
      });

    })

    // set product options
    function setProducts(data){
      var container = $('[js-set-products]');
      container.html(""); // erase container
      productsSelect.html("<option selected disabled> Выберите продукт</option>"); // erase select
      var appendedObj = ""

      // populate data
      $.each(data, function(i, product){
        appendedObj = appendedObj + "<div class='info-container'><h2>"+ product.name +"</h2><p>"+ product.description +"</p></div>"
        productsSelect.append('<option value='+product.id+'>' + product.name + '</option>');
      });

      productsSelect.selectric('refresh'); // refresh selectric for markup and bindings

      // show containers
      container.append(appendedObj).hide().slideDown();
      chooseProductsContainer.slideDown();

    }

    // set tarifs options
    function setTarifs(data){
      // update select
      tarifSelect.html("<option selected disabled>"+data.select+"</option>"); // erase select
      $.each(data.tarifs, function(i, tarif){
        tarifSelect.append('<option value='+tarif.id+'>' + tarif.select_value + '</option>');
      });
      tarifSelect.selectric('refresh');

      // show containers
      chooseTarifsContainer.slideDown();
    }

    // display options
    function displayOptions(){
      calcOptionsContainer.slideDown();
      calcTableContainer.slideDown();
      calcCtaContainer.slideDown();

    }


    // EQUIPMENT
    var $cbs = $('input[price]');
    var $settingsForm = $('#settingsForm');
    var $settingsHeader = $settingsForm.find('.settings-header');
    var $settingsBody = $settingsForm.find('.settings-value');
    var $settingsOptions = $settingsForm.find('.settings-options');
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

    // SET PRICE
    function calcUsage() {
      var total = 0;
      $cbs.each(function () {
        if ($(this).is(":checked"))
          total = parseFloat(total) + parseFloat($(this).val());
      });
      $("#pay_price").text(total + ' ₽');
      $("#pay_price2").text(total + ' ₽');
    }

    _document.on('click', $cbs, calcUsage)
    calcUsage();


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

    // Product translator
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

        if (!formSettings.options.length) {
          $settingsOptions.find('.g-check.empty').css('display', 'block');
        } else {
          $settingsOptions.find('.g-check.empty').css('display', 'none');
        }
      });
    }());


  }

  //////////
  // SLIDERS
  //////////
  function initSliders() {

    $('.main-slider').not('.slick-initialized').slick({
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
  // SELECTRIC
  ////////////
  function initSelectric(){
    $('select').selectric();

    $('.choose-doc li').on('click', function(e) {
      var $self = $(this),
          tabIndex = $self.index();
      $self.siblings().removeClass('active');
      $self.addClass('active');
      $('.contract__item').removeClass('active').eq(tabIndex).addClass('active');

      e.preventDefault();
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
        scrollTop: 1,
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

    setTimeout(revealFooter, 300)
  });

  // some plugins get bindings onNewPage only that way
  function triggerBody() {
    _window.scrollTop(0)
    _window.scroll();
    _window.resize();
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


  function initValidate(){
    ////////////////
    // FORM VALIDATIONS
    ////////////////

    // jQuery validate plugin
    // https://jqueryvalidation.org


    // GENERIC FUNCTIONS
    ////////////////////

    var validateErrorPlacement = function(error, element) {
      error.addClass('ui-input__validation');
      error.appendTo(element.parent("div"));
    }
    var validateHighlight = function(element) {
      $(element).parent('div').addClass("has-error");
    }
    var validateUnhighlight = function(element) {
      $(element).parent('div').removeClass("has-error");
    }
    var validateSubmitHandler = function(form) {
      $(form).addClass('loading');
      $.ajax({
        type: "POST",
        url: $(form).attr('action'),
        data: $(form).serialize(),
        success: function(response) {
          $(form).removeClass('loading');
          var data = $.parseJSON(response);
          if (data.status == 'success') {
            // do something I can't test
          } else {
              $(form).find('[data-error]').html(data.message).show();
          }
        }
      });
    }

    var validatePhone = {
      required: true,
      normalizer: function(value) {
          var PHONE_MASK = '+X (XXX) XXX-XXXX';
          if (!value || value === PHONE_MASK) {
              return value;
          } else {
              return value.replace(/[^\d]/g, '');
          }
      },
      minlength: 11,
      digits: true
    }

    ////////
    // FORMS


    /////////////////////
    // REGISTRATION FORM
    ////////////////////
    $(".js-registration-form").validate({
      errorPlacement: validateErrorPlacement,
      highlight: validateHighlight,
      unhighlight: validateUnhighlight,
      submitHandler: validateSubmitHandler,
      rules: {
        last_name: "required",
        first_name: "required",
        ot_name: "required",
        email: {
          required: true,
          email: true
        },
        password: {
          required: true,
          minlength: 6,
        },
        phone: validatePhone
      },
      messages: {
        last_name: "Заполните это поле",
        first_name: "Заполните это поле",
        ot_name: "Заполните это поле",
        email: {
            required: "Заполните это поле",
            email: "Email содержит неправильный формат"
        },
        password: {
            required: "Заполните это поле",
            email: "Пароль мимимум 6 символов"
        },
        phone: {
            required: "Заполните это поле",
            minlength: "Введите корректный телефон"
        },
      }
    });

  }
});
