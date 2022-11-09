import {symbol} from "prop-types";

$(document).ready(function () {
  $(document).on('click', '.view-notification', function () {
    $.ajax({
      url: "/notifications",
      type: "get",
      dataType: "script",
      data: {}
    })
  })

  $(document).on('click', '.dark-theme-slider', function () {
    lightSelected = $(this).hasClass('lightTheme');
    document.getElementById('themeChange').setAttribute('href', lightSelected ? 'dark' : '');
  });

  $(document).on('click', '.copyUserAddress', function () {
    var copyText = document.getElementById("userAddress");
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */
    document.execCommand("copy");
    toastr.success('Copied successfully.')
  });

  $(document).on("click", ".dashboard-load-more", function (e) {
    const page_no = $(".dashboard-load-more").attr("data-page-no")
    $.ajax({
      url: "/category_filter",
      type: "get",
      dataType: "script",
      data: { page_no, category: $(this).data("category"), sort_by: $(this).data("sort-by")}
    })
  });

  $(window).scroll(function() {
    if ($(window).scrollTop() == $(document).height() - $(window).height()) {
      $(".dashboard-load-more").click()
      $(".user-load-more").click()
    }
  });

  $(".scrollbar-activity").scroll(function() {
    if ($(".scrollbar-activity").scrollTop() > $(".overall-activities").height() - $(".scrollbar-activity").height()) {
      $(".common-activity-load-more").click()
    }

  })

  $(document).on("click", ".user-load-more", function (e) {
    $.ajax({
      url: "/users/load_tabs",
      type: "get",
      dataType: "script",
      data: {id: $(this).data("id"), page_no: $(this).data("page-no"), tab: $(this).data("tab")}
    })
  });

  $(document).on("click", ".common-activity-load-more", function (e) {
    $.ajax({
      url: "/load_more_activities",
      type: "get",
      dataType: "script",
      data: {id: $(this).data("id"), page_no: $(this).data("page-no"), tab: $(this).data("tab")}
    })
  });

  $(document).on("click", ".dashboard-sort-by", function(e) {
    e.preventDefault()
    var dataParam = {}
    if ($(".top-filter li.active a").data("name")) {
      dataParam["category"] = $(".top-filter li.active a").data("name")
    }

    if ($(this).data("name")) {
      dataParam["sort_by"] = $(this).data("name")
    }

    $.ajax({
      url: "/category_filter",
      type: "get",
      dataType: "script",
      data: dataParam
    })
  })

  $(document).on("click", ".crete-model-close", function(e) {
    $("#collectionCreateForm :input").prop("disabled", false);
  })
  preventNegativeNumbers(document.getElementById('royalties'));
  preventNegativeNumbers(document.getElementById('bid_amt'));
  preventNegativeNumbers(document.getElementById('bid_qty'));
  preventNegativeNumbers(document.getElementById('tokens'));
  preventNegativeNumbers(document.getElementById('burn_tokens'));
  preventNegativeNumbers(document.getElementById('no_of_copies'));
  preventNegativeNumbers(document.getElementById('instant-price'));
  preventNegativeNumbers(document.getElementsByClassName('preventNegativeNumbers'));
  $('.timed-action-trigger').each(function () {
    timed_auction_trigger(this)
  });

  $(document).on("click", ".comment-reply", function(e) {
    e.preventDefault()
    const id = $(this).data("id")
    const commentInput = $(`#comment_input_${id}`)
    const message = commentInput.html()
    if(!message) {
      toastr.error('Please enter the comment')
      return
    }
    const commentSection = $(`#comment_section_${id}`)
    createComment({
      parent_id: id,
      message,
      collection: commentSection.data("address"),
    }, commentSection, commentInput, 'update')
  })

  $(document).on("click", ".comment-create", function(e) {
    e.preventDefault()
    const id = $(this).data('id')
    const commentInput = $(`#comment-input-${id}`)
    const commentSection = $(`#comment-section-${id}`)
    const message = commentInput.html()
    if(!message) {
      toastr.error('Please enter the comment')
      return
    }
    createComment({
      parent_id: null,
      message,
      collection: commentInput.data("address"),
    }, commentSection, commentInput)
  })

  $(document).on("click", ".comment-reply-show", function(e) {
    e.preventDefault()
    if($('#comment-section').hasClass( "disabled" )) {
      return
    }
    const id = $(this).data("id")
    $(`#comment_reply_div_${id}`).toggleClass('hide');
  })


  $(document).on("click", '.feed-show', function(e) {
    e.preventDefault()
    $(`.feed-show-${$(this).data('id')}`).toggleClass('hide')
  });

  $(document).on("click", '.comment-delete', function(e) {
    e.preventDefault();
    const id = $(this).data('id');
    const address = $(`#comment_section_${id}`).data('address')
    $.ajax({
      url: `/comments/${id}`,
      type: "DELETE",
      dataType: 'json',
      success: function(data) {
       if(!data.status) {
        toastr.error(data.text)
        return
       }
      const countTag = $(`#comment-count-${address}`)
      if(countTag.length) {
        countTag.text(`${data.count} Comments`)
      }
       $(`#comment_block_${id}`).remove()
      },
      error: function(data) {
        toastr.error('Something went wrong')
      },
    })

  });
  

  $(document).on('ajax:success', '.load-collection-category', (event) => {
    const [data, status, xhr] = event.detail;
    $('.load-collection-category').parent('li').removeClass('active')
    const _this = $(event.target)
    _this.parent('li').addClass('active')
    $('#load-more-posts').attr('href', _this.attr('action_type'))
    $('#collection-list').html(data.html);
    if(data.page_present == false) {
      $('#load-more-posts').hide();
    }else {
      $('#load-more-posts').show();
    }
    ReactRailsUJS.mountComponents()
  });
  $(document).on('ajax:success', '#load-more-posts', (event) => {
    const [data, status, xhr] = event.detail;
    $('#collection-list').append(data.html);
    $('#load-more-posts').attr('href', data.next_page);
    if(data.page_present == false) {
      $('#load-more-posts').hide();
    }else {
      $('#load-more-posts').show();
    }
    ReactRailsUJS.mountComponents()
  });

  $(document).on('ajax:success', '#load-more-users', (event) => {
    const [data, status, xhr] = event.detail;
    $('#users-list').append(data.html);
    $('#load-more-users').attr('href', data.next_page);
    if(data.page_present == false) {
      $('#load-more-users').hide();
    }else {
      $('#load-more-users').show();
    }
  });

  $(document).on('click', '.save-collection', function(e){
    e.preventDefault()
    const _this = this
    const address = $(_this).data('address')
    const status = $(_this).data('status')
    $.ajax({
      url: "/feed/save_collection",
      type: "post",
      dataType: 'json',
      data: {
        address
      },
      success: function(data) {
        if (data.status) {
          $(_this).html('<i class="fas fa-bookmark"></i> <span>Undo</span>');
        }else {
          $(_this).html('<i class="far fa-bookmark"></i> <span>Save</span>');
        }
        toastr.success(data.status_text)
      },
      error: function(data) {
        toastr.error('Something went wrong')
      },
    })
  });
});

function createComment(comment, commentSection, commentInput = null) {
  if($('#comment-section').hasClass( "disabled" )) {
    return
  }
  $.ajax({
    url: "/comments",
    type: "post",
    dataType: "json",
    data: {
      comment
    },
    success: function(data) {
      if(commentInput) {
        commentInput.html('')
      }
      commentSection.append(data.html)
      const countTag = $(`#comment-count-${comment.collection}`)
      if(countTag.length) {
        countTag.text(`${data.count} Comments`)
      }
      ReactRailsUJS.mountComponents()
      window.at_who(window.users)
    },
    error: function(data) {
      toastr.error('Something went wrong')
    },
  })
}

window.limit_char = function limit_char(element, max_chars = 5){
  if(element.value.length > max_chars) {
    const defaultVal = '9';
    element.value = element.value.substr(0, max_chars);
    toastr.error('You cant enter more than ' + defaultVal.padStart(max_chars, 9))
  }
}
function preventNegativeNumbers(inputs){
  if(!inputs) {return;}
  inputs = 'HTMLCollection' === inputs.constructor.name ? Array.from(inputs) : Array.of(inputs)
  inputs.forEach(negativeNumberPrevent)
}

function negativeNumberPrevent(input) {
  input.addEventListener('keypress', function(e) {
    var key = !isNaN(e.charCode) ? e.charCode : e.keyCode;
    function keyAllowed() {
      var keys = [8,9,13,16,17,18,19,20,27,46,48,49,50,
                  51,52,53,54,55,56,57,91,92,93];
      if (key && keys.indexOf(key) === -1)
        return false;
      else
        return true;
    }
    if (!keyAllowed())
      e.preventDefault();
  }, false);

  // EDIT: Disallow pasting non-number content
  input.addEventListener('paste', function(e) {
    var pasteData = e.clipboardData.getData('text/plain');
    if (pasteData.match(/[^0-9]/))
      e.preventDefault();
  }, false);
}

const timers = [];

function timed_auction_trigger(_this){
  timers[_this.id] = setInterval(function() {
    if (_this) {
      const end_time = _this.value
      const address = $(_this).data('address')
      const countDownDate = new Date(end_time).getTime();
      const collectionShowPage = $(_this).data('collection-show')
      let tempArray = [];
      let now = new Date().getTime();
      let distance = countDownDate - now;
      // Time calculations for days, hours, minutes and seconds
      let days = Math.floor(distance / (1000 * 60 * 60 * 24));
      let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((distance % (1000 * 60)) / 1000);
      if(collectionShowPage) {
        $('#tA-days').text(days)
        $('#tA-hours').text(hours)
        $('#tA-minutes').text(minutes)
        $('#tA-seconds').text(seconds)
      } else {
        days = days ? days + "d " : ""
        hours = hours ? (hours>=10? hours: '0'+hours) + "h " : "00h"
        minutes = minutes ? (minutes>=10? minutes: '0'+minutes) + "m " : "00m"
        seconds = seconds ? (seconds>=10? seconds: '0'+seconds) + "s " : "00s"
        const result =  days + hours + minutes + seconds;
        tempArray = document.getElementsByClassName(address + "-timedAuction-Countdown");
        for(let i=0;i<tempArray.length;i++){
          tempArray[i].innerHTML = result;
        }
      }

      // If the count down is over, write some text
      if (distance < 0) {
        clearInterval(timers[_this.id]);
        if(collectionShowPage) {
          $('#timedAuction-countdown, #collection-actions').hide();
          $('.end-action').show();
          document.getElementById('instant-price').style.display = "none";
        }
        else {
          tempArray = document.getElementsByClassName(address +"-timedAuction-Countdown");
          for(let i=0;i<tempArray.length;i++){
            tempArray[i].innerHTML = "Expired";
          }
          $('.'+ address + "-timedAuction-Headline").hide();
        }
      }
    }
  }, 1000);
}

