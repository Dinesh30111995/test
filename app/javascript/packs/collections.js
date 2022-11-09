$(document).ready(function () {


  $("#collection_instant_sale_enabled").click(function(event) {
    if ($("#collection_timed_auction_enabled").val() == 'true') {
      toastr.error("Instant sale price can't be enabled while timed auction is enabled");
      event.preventDefault();
    }
  })

  $(document).on("change", "#collection-put-on-sale", function () {
    if (!$(this).is(":checked")) {
      $('#collection_instant_sale_enabled').prop("checked", false).change();
      $('#collection-unlock-on-purchase').prop("checked", false).change();
    }
  })

  $(document).on("change", "#collection_instant_sale_enabled", function () {
    if ($(this).is(":checked")) {
      $("#instPrice").removeClass("hide")
    } else {
      $("#instPrice").addClass("hide")
    }
  });

  $(document).on("change", "#collection-unlock-on-purchase", function () {
    if ($(this).is(":checked")) {
      $(".unlock-description-section").removeClass("hide")
    } else {
      $(".unlock-description-section").addClass("hide")
    }
  });

  $('#collection_put_on_sale, #collection-put-on-sale').click(function() {
    if ($(this).is(":checked")) {
      $("#timedAuction").removeClass("hide")
      $('#minimumBid').removeClass('hide')
    } else {
      $("#timedAuction").addClass("hide")
      $("#collection_minimum_bid").val('')
      $("#minimumBid").addClass("hide")
      $("#collection_timed_auction_enabled").prop('checked',false)
      $("#collection_minimum_bid").closest("li").addClass("hide")
      $("#collection_bid_time").closest("li").addClass("hide")
    }
    auctionChange($("#collection_timed_auction_enabled"))
  });

  $('#collection_timed_auction_enabled').click(function(){
    auctionChange(this)
  });

  function auctionChange(_this){
    if($(_this).data('feed')) {
      if ($(_this).is(":checked")) {
        $("#collection_bid_time_div").removeClass("hide")
        $("#collection_bid_time").closest("div").removeClass("hide")
      } else {
        $("#collection_bid_time_div").addClass("hide")
      }
      return
    }

    if ($(_this).is(":checked")) {
      $("#collection_minimum_bid").closest("li").removeClass("hide")
      $("#collection_bid_time").closest("li").removeClass("hide")
      $('.instPrice').hide()
      $("#collection_instant_sale_enabled").prop('checked',false)
      $('#instant-price').val('')
    } else {
      $("#collection_minimum_bid").closest("li").addClass("hide")
      $("#collection_bid_time").closest("li").addClass("hide")
      $('.instPrice').show()
    }
  }

  // Collection Attribute Add/Remove section
  function updateJsonField(entryClass) {
    var data = {}
    $.each($(entryClass), function (i, collection) {
      var attrKey = $(collection).find(".attr-key").val()
      var attrVal = $(collection).find(".attr-val").val()
      if (attrKey.length > 0 && attrVal.length > 0) {
        data[attrKey] = attrVal
      }
    })
    $(".collection-data-val").val(JSON.stringify(data))
  }

  function processAttribute(
      _this,
      parentClass = '.collection-attribute-entry',
      appendTo = '.collection-attribute-section',
      entryClass = '.collection-attribute-section .collection-attribute-entry'
  ) {
    var inputKey = _this.closest(parentClass).find(".attr-key").val()
    var inputVal = _this.closest(parentClass).find(".attr-val").val()
    console.log(inputKey, _this, _this.closest(parentClass))
    if (inputKey.length > 0 && inputVal.length > 0) {
      var nonEmptyKey = $('.attr-key').filter(function () {
        return this.value === ''
      });
      var nonEmptyval = $('.attr-val').filter(function () {
        return this.value === ''
      });

      if (nonEmptyKey.length <= 1 && nonEmptyval.length <= 1) {
        var collectionAttrLength = $(parentClass).length
        var clonedDiv = $('.collection-attribute-entry-base').clone()
        clonedDiv.removeClass('hide collection-attribute-entry-base')
        clonedDiv.find(".attr-key").attr("name", "collection[attributes][" + collectionAttrLength + "][key]")
        clonedDiv.find(".attr-val").attr("name", "collection[attributes][" + collectionAttrLength + "][val]")
        clonedDiv.appendTo(appendTo)
      }
    }

    if (inputKey.length === 0 || inputVal.length === 0) {
      var emptyKey = $('.attr-key').filter(function () {
        return this.value === ''
      });
      var emptyval = $('.attr-val').filter(function () {
        return this.value === ''
      });

      if (emptyKey.length == 3 || emptyval.length === 3) {
        var totalEntry = $(entryClass).length
        var collections = $(entryClass)
        var currentCollection = collections[totalEntry - 1]
        currentCollection.remove()
      }
    }

    updateJsonField(entryClass)
  }

  // Collection Attribute Add/Remove section end
function attributes(_this) {
  if($(_this)?.closest('.attribute-section')?.length) {
    processAttribute($(_this), '.attribute-section', '.attribute-section', '.attribute-section')
  }else {
    processAttribute($(_this))
  }
}
  $(document).on("keyup", ".attr-key", function () {
    attributes($(this))
  })

  $(document).on("keyup", ".attr-val", function () {
    attributes($(this))
  })

  // // ERC 721 section
  // $(document).on("click", ".chooseCollectionNft", function() {
  //   $("#createOwnErc721").modal("hide")
  //   $("#createOwnErc721").find(":input").prop("disabled", true)
  // })
  // // ERC 721 section end

  // Process and Approve section

  $(document).on("click", ".triggerCollectionValidation", function (e) {
    e.preventDefault()
    var form = $("#collectionCreateForm")[0]
    var source = $("#collection_source").val();
    if (source == "opensea" || form.checkValidity()) {
      var MintType = $("input[name=chooseMintType]").filter(":checked").val();
      var isImportNft = $('#collection_imported').val();
      if((isImportNft == undefined ) && (MintType == undefined))
      {
        return toastr.error('Please select minting type')
      }else{
        if ($('#collection_instant_sale_enabled').is(":checked") && (!validFloat($("#instant-price").val()))) {
          return toastr.error('Please enter valid instant price')
        }  else if ($('#collection_put_on_sale').is(":checked") && (!validFloat($("#minimum_bid").val()))) {
          return toastr.error('Please enter minimum bid')
        } else if ($('#collection_timed_auction_enabled').is(":checked") && (!validFloat($("#collection_bid_time").val()))) {
          return toastr.error('Please enter bid time')
        }else if($("input[name=chooseCollection]").filter(":checked").val()=="create" && MintType == "lazy"){
          return toastr.error('Lazy Minting disabled with Own Contract');
        } else if ($('#no_of_copies').length && !validNum($('#no_of_copies').val())) {
          return toastr.error('Please enter valid no of copies')
        } else if ($('#no_of_copies').length && $("#no_of_copies")[0].validationMessage !== "") {
          return toastr.error("Number of copies " + $("#no_of_copies")[0].validationMessage.toLowerCase())
        } else {
          if($('#collection_instant_sale_enabled').is(":checked") == false){
            $('#instant-price').val('')
          }
          if($('#collection_timed_auction_enabled').is(":checked") == false){
            $("#collection_bid_time").val('')
          }
          $("#submitCollection").click();
          $("#collectionCreateForm :input").prop("disabled", true);
        }
      }
    } else {
      var collectionType = $("input[name=chooseCollection]").filter(":checked").val();
      if ($('#file-1').val() === '') {
        return toastr.error('Please select collection file')
      } else if ($("#collection-category option:selected").length === 0) {
        return toastr.error('Please select categories')
      } else if (collectionType === undefined) {
        return toastr.error('Please select collection type')
      } else if ($('#collection-name').val() === '') {
        return toastr.error('Please provide collection name')
      } else if ($('#description').val() === '') {
        return toastr.error('Please provide collection description')
      } else if ($('#no_of_copies').length && !validNum($('#no_of_copies').val())) {
        return toastr.error('Please enter valid no of copies')
      } else {
        toastr.error('Please fill all required fields.')
      }
    }
  })

  $(document).on("click", ".collection-submit", function (e) {
    e.preventDefault()
    $(this).text("In Progress");
    $(this).closest(".row").find("status-icon").html('<div class="follow-step-2-icon"><div class="loader"></div></div>')
    $(".collection-submit-btn").click()
  })

  $(document).on("click", ".default-btn", function (e) {
    e.preventDefault()
  })

  $(document).on("click", ".createOwnErc721Form", function () {
    startContractDeploy($('#collection_contract_type').val())
  });

  window.startContractDeploy = function startContractDeploy(contractType) {
    var name = $('#nft_contract_name').val().trim();
    var symbol = $('#nft_contract_symbol').val().trim();
    var collectionId = $('#collection_id').val();
    if (!name || !symbol) {
      toastr.info('Provide valid name and symbol')
      $.magnificPopup.close();
      $.magnificPopup.open({
        closeOnBgClick: false ,
		    enableEscapeKey: false,
        items: {
          src: '#createOwnErc721'
        },
        type: 'inline'
      });
    } else {
      var compiled_details = getContractABIAndBytecode('', contractType, false); //shared=false
      console.log(compiled_details)
      var abi = compiled_details['compiled_contract_details']['abi']
      var bytecode = compiled_details['compiled_contract_details']['bytecode']
      console.log(abi, bytecode, name, symbol, contractType, collectionId)
      contractDeployInit()
      deployContract(abi, bytecode, name, symbol, contractType, collectionId);
    }
  }

  window.contractDeployInit = function contractDeployInit() {
//        $("#createOwnErc721").modal("hide")
    $.magnificPopup.close();
//        $("#deployContract").modal("show")
    $.magnificPopup.open({
      closeOnBgClick: false ,
		  enableEscapeKey: false,
      items: {
        src: '#deployContract'
      },
      type: 'inline'
    });
    $('.deployProgress').removeClass('hide')
    $('.deployDone').addClass('hide')
    $('.deployRetry').addClass('hide')
    $('.signStart').addClass('grey').removeClass('hide')
    $('.signProgress').addClass('hide')
    $('.signRetry').addClass('hide')
    $('.signDone').addClass('hide')
  }

  window.contractDeploySuccess = function contractDeploySuccess(contractAddress, contractType) {
    console.log("Contract Address: " + contractAddress);
    $('.deployProgress').addClass('hide')
    $('.deployProgress').addClass('hide')
    $('.deployDone').addClass('disabledLink').removeClass('hide')

    //  OPEN SIGN METHOD
    // $('.signDone').addClass('hide')
    // $('.signStart').addClass('hide')
    // $('.signProgress').removeClass('hide')
    console.log(contractAddress, contractType)
    // var MintType = $("input[name=chooseMintType]").filter(":checked").val()
    // console.log(MintType)
    // if(MintType=='lazy'){
    //   initLazyMint()
    // }else{
      initCollectionCreate(contractAddress, contractType) // Lazy Mint disabled for Own Contract
    // }
  }

  window.contractDeployFailed = function contractDeployFailed(errorMsg) {
    toastr.error(errorMsg)
    $('.deployProgress').addClass('hide')
    $('.deployDone').addClass('hide')
    $('.deployRetry').removeClass('hide').addClass('grey')
  }

  $(document).on("click", ".deployRetry", function () {
    startContractDeploy($('#collection_contract_type').val())
  })

  window.initCollectionCreate = function initCollectionCreate(contractAddress, contractType) {
    var existingToken = $("#collection_token").val()
    collectionCreateInit(contractAddress, existingToken)
    var sharedCollection = ($("input[name=chooseCollection]").filter(":checked").val() === 'nft')
    approveNFT(contractType, contractAddress, sharedCollection, 'collection', existingToken)
  }

  window.initLazyMint = function initLazyMint()
  {
    approveCollection($('#collection_id').val());
    if ($('#collection_instant_sale_enabled').is(":checked"))
    {
     collectionCreateInit(null, true)
     console.log('Signing using metamask')
     initsignFixedPriceProcess(true)
    }else{
      toastr.success('Collection created succcessfully.')
      window.location.href = '/collections/' + $('#collection_id').val()
    }
  }

  window.collectionCreateInit = function collectionCreateInit(contractAddress, lazy_minting=false, existingToken=null) {
    if ($('#collection_instant_sale_enabled').is(":checked")) {
      $('.signFixedPrice').removeClass('hide')
    } else {
      $('.signFixedPrice').addClass('hide')
    }
    // $("#deployContract").modal("hide")
    // $("#collectionStepModal").modal("show")
    $.magnificPopup.close();
    $.magnificPopup.open({
      closeOnBgClick: false ,
		  enableEscapeKey: false,
      items: {
        src: '#collectionStepModal'
      },
      type: 'inline',
      callbacks: {
        close: function close() {
          $("#collectionCreateForm :input").prop("disabled", false);
        }
      }
    });
    if(lazy_minting){
      $('.mintFlow').addClass('hide')
      $('.approveFlow').addClass('hide')
    }
    if (existingToken) {
      $('.mintFlow').addClass('hide')
    }
    $("#deployContract").modal("hide")
    $("#collectionStepModal").modal("show")
    $('.allProgress').addClass('hide')
    $('.allDone').addClass('hide')
    $('.allRetry').addClass('hide')
    $('.allStart').removeClass('hide').addClass('grey')
    $('.approveProgress').removeClass('hide')
  }

  window.collectionApproveSuccess = function collectionApproveSuccess(contractType, existingToken=null) {
    mintCollectionCreate(contractType, existingToken)
  }

  function mintCollectionCreate(contractType, existingToken=null) {
    $('.allProgress').addClass('hide')
    $('.allDone').addClass('hide')
    $('.allRetry').addClass('hide')
    $('.allStart').addClass('hide').addClass('grey')
    $('.approveDone').removeClass('hide').removeClass('grey').addClass('disabledLink')
    $('.mintProgress').removeClass('hide')
    $('.signFixPriceStart').removeClass('hide').addClass('grey')
    // TODO: WHILE CHANGE NFT TO SHARED/OWNER THS HAS TO BE CHANGED
    var sharedCollection = ($("input[name=chooseCollection]").filter(":checked").val() === 'nft')
    if (existingToken) {
      initsignFixedPriceProcess()
    } else {
      if(contractType === 'nft721') {
        createCollectible721($('#collection_contract_address').val(), $('#collection_token_uri').val(),
          $('#collection_royalty_fee').val(), $('#collection_id').val(), sharedCollection)
      } else if (contractType === 'nft1155') {
        createCollectible1155($('#collection_contract_address').val(), $('#collection_supply').val(),
          $('#collection_token_uri').val(), $('#collection_royalty_fee').val(), $('#collection_id').val(), sharedCollection)
      }
    }
  }

  window.collectionApproveFailed = function collectionApproveFailed(errorMsg) {
    toastr.error(errorMsg)
    $('.allProgress').addClass('hide')
    $('.allDone').addClass('hide')
    $('.allRetry').addClass('hide')
    $('.allStart').removeClass('hide').addClass('grey')
    $('.approveRetry').removeClass('hide')
  }

  $(document).on("click", ".approveRetry", function () {
    if ($('#priceChange').length) {
      initApproveResale()
    } else {
      initCollectionCreate($('#collection_contract_address').val(), $('#collection_contract_type').val())
    }
  })

  $(document).on("click", ".mintRetry", function () {
    mintCollectionCreate($('#collection_contract_type').val())
  })

  window.collectionMintSuccess = function collectionMintSuccess(collectionId) {
    if ($('#collection_instant_sale_enabled').is(":checked")) {
      $('.mintProgress').addClass('hide')
      $('.mintDone').removeClass('hide')
      initsignFixedPriceProcess()
    } else {
      toastr.success('Collection created succcessfully.')
      window.location.href = '/collections/' + collectionId
    }
  }

  window.collectionMintFailed = function collectionMintFailed(errorMsg, contractType) {
    toastr.error(errorMsg)
    $('.allProgress').addClass('hide')
    $('.allDone').addClass('hide')
    $('.allRetry').addClass('hide')
    $('.allStart').removeClass('hide').addClass('grey')
    $('.approveDone').removeClass('hide').removeClass('grey').addClass('disabledLink')
    $('.mintStart').addClass('hide')
    $('.mintRetry').removeClass('hide')
  }

  window.initsignFixedPriceProcess = function initsignFixedPriceProcess(is_lazy_minting=false) {
    hideAll()
    $('.convertDone').removeClass('hide')
    $('.approveDone').removeClass('hide')
    $('.mintDone').removeClass('hide')
    $('.signFixPriceProgress').removeClass('hide')
    var pay_token_address = $('#collection_erc20_token_id option:selected, this').attr('address')
    var details = fetchCollectionDetails(null, pay_token_address)
    if (details) {
      console.log(details['unit_price'], details['pay_token_decimal'], details['pay_token_address'],
        details['token_id'], details['asset_address'], details['collection_id'])
      if(is_lazy_minting)
      {
        //tokenID is 0 for Lazy-minting blocks
        var tokenId = 0
        signSellOrder(details['unit_price'], details['pay_token_decimal'], details['pay_token_address'],
        tokenId, details['asset_address'], details['collection_id'])
      }else{
        signSellOrder(details['unit_price'], details['pay_token_decimal'], details['pay_token_address'],
        details['token_id'], details['asset_address'], details['collection_id'])
        }
    } else {
      bidSignFixedFailed('Unable to fetch tokan details. Please try again later')
    }
  }

  window.bidSignFixedSuccess = function bidSignFixedSuccess(collectionId) {
    toastr.success('Collection created succcessfully.')
    window.location.href = '/collections/' + collectionId
  }

  window.bidSignFixedFailed = function bidSignFailed(errorMsg) {
    toastr.error(errorMsg)
    hideAll()
    $('.convertDone').removeClass('hide')
    $('.approveDone').removeClass('hide')
    $('.mintDone').removeClass('hide')
    $('.signFixPriceRetry').removeClass('hide')
  }

  $(document).on("click", ".signFixPriceRetry", function () {
    if($('#priceChange').length){
      initsignFixedPriceUpdate()
    }else{
      var MintType = $("input[name=chooseMintType]").filter(":checked").val()
      if(MintType == 'lazy'){
        initsignFixedPriceProcess(true)
      }else{
        initsignFixedPriceProcess($("input[name=chooseMintType]").filter(":checked").val() === 'lazy')
      }
    }
  })

  // BIDDING MODEL STARTS HERE
  // Process and Approve section
  $(document).on("click", ".triggerBiddingValidation", function (e) {
    clearToastr();
    e.preventDefault()
    var form = $("#biddingForm")[0]
    var bid_amt = parseFloat($('#bid_amt').val());
    var coll_bid_val = parseFloat(gon.collection_max_bid);
    var form_validation_success = true;
    if ($('#bid_qty').length && !validNum($('#bid_qty').val())) {
      return toastr.error('Please enter valid quantity');
    } else if (!validFloat($('#bid_amt').val())) {
      return toastr.error('Please enter valid price')
    } else if($('#collection_min_bid_price_currency').val() == $('#bid_currency :selected').attr('address') && $('#collection_min_bid_price').val() > $('#bid_amt').val()){
      return toastr.error('Please enter price greater than minimum bid')
    } else if (gon.is_bids_exists && bid_amt <= coll_bid_val){
      return toastr.error('Please enter price greater than maximum bid')
    } else if (!gon.is_bids_exists &&  (bid_amt != coll_bid_val && bid_amt < coll_bid_val ) ) {
      return toastr.error('Please enter price greater than minimum bid')
    } else if(form.checkValidity()) {
      $("#biddingForm :input").prop("disabled", true);
      var contractAddress = $('#bid_currency :selected').attr('address');
      var decimals = $('#bid_currency :selected').attr('decimals');
      initBidProcess(contractAddress, decimals);
    } else if ($("#bid_qty")[0].validationMessage !== "") {
      return toastr.error($("#bid_qty")[0].validationMessage)
    }
  })

  $(document).on("click", ".triggerSwapValidation", function (e) {
    clearToastr();
    e.preventDefault()
    var requestor_collection_id = $("input[name=nftradio]:checked").val()
    var requestor_total_quantity = parseInt($("input[name=nftradio]:checked").parent().find('#requestor_total_quantity').text())
    var owner_total_quantity = parseInt($('#owner_quanowner_total_quantitytity').text())
    var owner_quantity = parseInt($('#owner_quantity').val())
    var owner_total_quantity = parseInt($('#owner_total_quantity').text())
    var requestor_quantity = parseInt($("input[name=nftradio]:checked").parent().find('#requestor_quantity').val())
    var owner_collection_address = $('#collection_id').val()
    var requestor_contract_address = $("input[name=nftradio]:checked").parent().find('#requestor_contract_address').val()
    var requestor_collection_token = $("input[name=nftradio]:checked").parent().find('#requestor_collection_token_id').val()
    var owner_contract_address = $('#owner_contract_address').val()
    var owner_collection_token = $('#owner_collection_token_id').val()
    var collectionId = gon.collection_data.collection_id
    var contractType = gon.collection_data.contract_type
    if(!validNum(requestor_collection_id)){
      return toastr.error('Please select a collection for swapping');
    }
    else if ((contractType === 'nft1155') && (!validNum(owner_quantity) || !validNum(requestor_quantity) || owner_quantity > owner_total_quantity || requestor_quantity > requestor_total_quantity)) {
      return toastr.error('Please enter valid quantity');
    } else if (!owner_collection_address) {
      return toastr.error('Invalid collection address')
    } else{
        hideAll()
        $('.signSwapProgress').removeClass('hide')
        $.magnificPopup.close();
        // setInterval(function () {
          $.magnificPopup.open({
            closeOnBgClick: false ,
            enableEscapeKey: false,
            items: {
              src: '#swapRequest'
            },
            type: 'inline'
          });
        // }, 500);

        signSwap(requestor_contract_address, requestor_collection_token, owner_contract_address, owner_collection_token, requestor_quantity, owner_quantity, collectionId);
    }
  });

  $(document).on("click", ".signSwapRetry", function () {
    var owner_quantity = parseInt($('#owner_quantity').val())
    var requestor_quantity = parseInt($("input[name=nftradio]:checked").parent().find('#requestor_quantity').val())
    var requestor_contract_address = $("input[name=nftradio]:checked").parent().find('#requestor_contract_address').val()
    var requestor_collection_token = $("input[name=nftradio]:checked").parent().find('#requestor_collection_token_id').val()
    var owner_contract_address = $('#owner_contract_address').val()
    var owner_collection_token = $('#owner_collection_token_id').val()
    var collectionId = gon.collection_data.collection_id
    hideAll()
    $('.signSwapProgress').removeClass('hide')
    $.magnificPopup.close();
    // setInterval(function () {
      $.magnificPopup.open({
        closeOnBgClick: false ,
        enableEscapeKey: false,
        items: {
          src: '#swapRequest'
        },
        type: 'inline'
      });
    // }, 500);

    signSwap(requestor_contract_address, requestor_collection_token, owner_contract_address, owner_collection_token, requestor_quantity, owner_quantity, collectionId);
  });

  $(document).on("click", ".viewSwap", function (e) {
    clearToastr();
    var collectionId = e.currentTarget.getAttribute('collectionId')
    console.log(collectionId)
    $('.ApproveSwap').removeClass('disableLinkButtons')
    show_modal('#swapDetail.'+collectionId)
  })

  window.updateSignSwapSuccess = async function updateSignSwapSuccess(signature) {
    var requestor_collection_id = $("input[name=nftradio]:checked").val()
    var requestor_quantity = $("input[name=nftradio]:checked").parent().find('#requestor_quantity').val()
    var owner_quantity = $('#owner_quantity').val() || 1
    var owner_collection_address = $('#collection_id').val()
    var requestor_contract_address = $("input[name=nftradio]:checked").parent().find('#requestor_contract_address').val()
    var requestor_collection_token = $("input[name=nftradio]:checked").parent().find('#requestor_collection_token_id').val()
    var owner_contract_address = $('#owner_contract_address').val()
    var owner_collection_token = $('#owner_collection_token_id').val()
    await createSwap(owner_collection_address, requestor_collection_id, requestor_quantity, owner_quantity, signature)
    toastr.success('Swap request created.')
    window.location.href = '/collections/' + owner_collection_address

  }
  window.updateSignSwapFailed = function updateSignSwapFailed(errorMsg) {
    toastr.error(errorMsg)
    hideAll()
    $('.signSwapRetry').removeClass('hide')
  }

  $(document).on("click", ".rejectSwap", async function (e) {
    var owner_collection_address = $('#collection_id').val()
    var swapId = e.currentTarget.getAttribute('data-swap-id')
    await rejectSwap(owner_collection_address, swapId)
    toastr.error('Swap request rejected.')
    window.location.href = '/collections/' + owner_collection_address
  })

  $(document).on("click", ".ApproveSwap", function (e) {
    hideAll()
    $('.approveSwapProgress').removeClass('hide')
    const swapId = e.currentTarget.getAttribute('data-swap-id')
    $('#approve_swap_id').val(swapId)
    show_modal('#approveSwapModal')
    e.target.classList.add('disableLinkButtons')
     approveSwapMethod($('#collection_id').val(), swapId)
  })

  $(document).on("click", ".approveSwapRetry", function () {
    hideAll()
    $('.approveSwapProgress').removeClass('hide')
    approveSwapMethod($('#collection_id').val(), $('#approve_swap_id').val())
  })

  async function approveSwapMethod(owner_collection_address, swapId)
  {
    var collectionId = gon.collection_data.collection_id
    var verify_swap = await verifySwap(owner_collection_address, swapId)
    if (verify_swap.success) {
      var details = fetchSwapDetails(swapId)
      console.log(details['requestor_address'], details['owner_address'],details['requestor_contract_address'],details['requestor_token_id'], details['owner_contract_address'],details['owner_token_id'], details['requestor_quantity'], details['owner_quantity'],details['signature'],details['asset_type'])
      approveSwap(details['requestor_address'], details['owner_address'],details['requestor_contract_address'],details['requestor_token_id'], details['owner_contract_address'],details['owner_token_id'], details['requestor_quantity'], details['owner_quantity'],details['signature'], details['asset_type'], swapId, collectionId)
    } else {
      toastr.error(verify_swap.errors.join(','))
    }
  }

  // TODO: WHILE ADDING NEW CUREENCIES HAVE TO MAKE LOGIC TO FETCH DECIMALS HERE
  window.initBidProcess = async function initBidProcess(contractAddress, contractDecimal) {
    var ethBal = await window.ethBalance();
    var curErc20Balance = $('#erc20_balance').text()
    // var ethBalance = $('#eth_balance').text()
    var totalAmt = $("#bid-total-amt-dp").attr('bidAmt')
    var symbol = $('#bid_currency :selected').text();
    console.log(curErc20Balance)
    console.log(totalAmt)
    console.log((isGreaterThanOrEqualTo(curErc20Balance, totalAmt)))
    console.log(symbol)
    if (isGreaterThanOrEqualTo(curErc20Balance, totalAmt)) {
      console.log('ONe')
      $('.convertEth').addClass("hide")
      initApproveBidProcess(contractAddress)
    } else if (symbol === gon.tokenSymbol && isGreaterThanOrEqualTo(ethBal, totalAmt)) {
      console.log('Two')
      convertCoinToToken(totalAmt-curErc20Balance)
    } else {
      console.log('THree')
      $("#biddingForm :input").prop("disabled", false);

      // $("#placeBid").modal("hide")
      $.magnificPopup.close();
      return toastr.error('Not enough balance')
    }
  }

  window.bidConvertSuccess = function bidConvertSuccess(transactionHash) {
    $('.convertProgress').addClass('hide')
    $('.convertDone').removeClass('hide')
    var contractAddress = $('#bid_currency option:selected, this').attr('address')
    initApproveBidProcess(contractAddress)
  }

  window.bidConvertFailed = function bidConvertFailed(errorMsg) {
    toastr.error(errorMsg)
    hideAll()
    $('.allStart').removeClass('hide').addClass('grey')
    $('.convertRetry').removeClass('hide')
  }

  window.initApproveBidProcess = function initApproveBidProcess(contractAddress, decimals = 18) {
    hideAll()
    $('.convertDone').removeClass('hide')
    $('.approvebidProgress').removeClass('hide')
    $('.signbidStart').removeClass('hide')
    $.magnificPopup.close();
    // setInterval(function () {
      $.magnificPopup.open({
        closeOnBgClick: false ,
		    enableEscapeKey: false,
        items: {
          src: '#placeBid'
        },
        type: 'inline'
      });
    // }, 500);

    approveERC20(contractAddress, 'erc20', toNum($("#bid-total-amt-dp").attr('bidAmt')), decimals)
  }

  window.bidApproveSuccess = function bidApproveSuccess(transactionHash, contractAddress) {
    $('.approvebidProgress').addClass('hide')
    $('.approvebidDone').removeClass('hide')
    var contractAddress = $('#bid_currency option:selected, this').attr('address')
    initSignBidProcess(contractAddress)
  }

  window.bidApproveFailed = function bidApproveFailed(errorMsg) {
    toastr.error(errorMsg)
    hideAll()
    $('.convertDone').removeClass('hide')
    $('.approvebidRetry').removeClass('hide')
    $('.signbidStart').removeClass('hide')
  }

  $(document).on("click", ".approvebidRetry", function () {
    var contractAddress = $('#bid_currency option:selected, this').attr('address')
    initApproveBidProcess(contractAddress)
  })

  window.initSignBidProcess = function initSignBidProcess(contractAddress) {
    hideAll()
    $('.convertDone').removeClass('hide')
    $('.approvebidDone').removeClass('hide')
    $('.signbidProgress').removeClass('hide')
    var details = fetchCollectionDetails(null, contractAddress)
    if (details) {
      console.log(details['asset_address'], details['token_id'], $("#bid_qty").val(), $("#bid-total-amt-dp").attr('bidAmt'),
        details['pay_token_address'], details['pay_token_decimal'], details['collection_id'], $("#bid-total-amt-dp").attr('bidPayAmt'))
      bidAsset(details['asset_address'], details['token_id'], $("#bid_qty").val(), toNum($("#bid-total-amt-dp").attr('bidAmt')),
        details['pay_token_address'], details['pay_token_decimal'], details['collection_id'], toNum($("#bid-total-amt-dp").attr('bidPayAmt')))
    } else {
      bidSignFailed('Unable to fetch tokan details. Please try again later')
    }
  }

  window.bidSignSuccess = function bidSignSuccess(collectionId) {
    toastr.success('Bidding succces.')
    window.location.href = '/collections/' + collectionId
  }

  window.bidSignFailed = function bidSignFailed(errorMsg) {
    toastr.error(errorMsg)
    hideAll()
    $('.convertDone').removeClass('hide')
    $('.approvebidDone').removeClass('hide')
    $('.signbidRetry').removeClass('hide')
  }

  $(document).on("click", ".signbidRetry", function () {
    var contractAddress = $('#bid_currency option:selected, this').attr('address')
    initSignBidProcess(contractAddress)
  })


  // BUYING MODEL STARTS HERE
  $(document).on("click", ".triggerBuyValidation", function (e) {
    console.log("Collection1: " + gon.collection_data)
    clearToastr();
    e.preventDefault()
    if (!validNum($('#buy_qty').val())) {
      return toastr.error('Please enter valid quantity');
    } else if (!isLessThanOrEqualTo($('#buy_qty').val(), $('#buy_qty').attr('maxQuantity'))) {
      return toastr.error('Maximum quantity available is ' + $('#buy_qty').attr('maxQuantity'))
    } else {
      $("#buyForm :input").prop("disabled", true);
      initBuyProcess();
    }
  })

  window.initBuyProcess = async function initBuyProcess() {
    var ethBal = await window.ethBalance();
    var curErc20Balance = $('#erc20_balance').text()
    // var ethBalance = $('#eth_balance').text()
    var totalAmt = toNum($("#buy-total-amt-dp").attr('buyAmt'));
    if (isGreaterThanOrEqualTo(curErc20Balance, totalAmt)) {
      $('.convertEth').addClass("hide")
      initApproveBuyProcess($("#buyContractAddress").text(), $("#buyContractDecimals").text())
    } else if (isGreaterThanOrEqualTo(ethBal, totalAmt)) {
      convertCoinToToken(totalAmt - curErc20Balance, 'Buy')
    } else {
      $("#buyForm :input").prop("disabled", false);
      // $("#placeBuy").modal("hide");
      $.magnificPopup.close();
      return toastr.error('Not enough balance');
    }
  }

  window.buyConvertSuccess = function buyConvertSuccess(transactionHash) {
    $('.convertProgress').addClass('hide')
    $('.convertDone').removeClass('hide')
    initApproveBuyProcess($("#buyContractAddress").text(), $("#buyContractDecimals").text())
  }

  window.buyConvertFailed = function buyConvertFailed(errorMsg) {
    toastr.error(errorMsg)
    hideAll()
    $('.allStart').removeClass('hide').addClass('grey')
    $('.convertRetry').removeClass('hide')
  }

  window.initApproveBuyProcess = function initApproveBuyProcess(contractAddress, contractDecimals) {
    hideAll()
    $('.convertDone').removeClass('hide')
    $('.approvebuyProgress').removeClass('hide')
    $('.purchaseStart').removeClass('hide')
    $.magnificPopup.close();
    // setInterval(function () {
      $.magnificPopup.open({
        closeOnBgClick: false ,
		    enableEscapeKey: false,
        items: {
          src: '#placeBuy'
        },
        type: 'inline'
      });
    // }, 500);
    $('.purchaseAndMintStart').removeClass('hide')
    $("#Buy-modal").modal("hide")
    $("#placeBuy").modal("show")
    approveERC20(contractAddress, 'erc20', toNum($("#buy-total-amt-dp").attr('buyAmt')), contractDecimals, 'Buy')
  }

  window.buyApproveSuccess = function buyApproveSuccess(transactionHash, contractAddress) {
    console.log("buyApproveSuccess")
    console.log(contractAddress)
    $('.approvebuyProgress').addClass('hide')
    $('.approvebuyDone').removeClass('hide')
    initPurchaseProcess(contractAddress)
  }

  window.buyApproveFailed = function buyApproveFailed(errorMsg) {
    toastr.error(errorMsg)
    hideAll()
    $('.convertDone').removeClass('hide')
    $('.approvebuyRetry').removeClass('hide')
    $('.purchaseStart').removeClass('hide')
    $('.purchaseAndMintStart').removeClass('hide')
  }

  $(document).on("click", ".approvebuyRetry", function () {
    initApproveBuyProcess($("#buyContractAddress").text(), $("#buyContractDecimals").text())
  })

  window.initPurchaseProcess = function initPurchaseBuyProcess(contractAddress) {
    hideAll()
    $('.convertDone').removeClass('hide')
    $('.approvebuyDone').removeClass('hide')
    $('.purchaseProgress').removeClass('hide')
    $('.purchaseAndMintProgress').removeClass('hide')
    console.log("initPurchaseProcess")
    console.log(contractAddress)
    var paymentDetails = fetchCollectionDetails(null, contractAddress)
    console.log(paymentDetails['owner_address'], toNum(paymentDetails['asset_type']), paymentDetails['asset_address'],
      paymentDetails['token_id'], toNum(paymentDetails['unit_price']), toNum($('#buy_qty').val()), toNum($("#buy-total-amt-dp").attr('buyAmt')),
      paymentDetails['pay_token_address'], toNum(paymentDetails['pay_token_decimal']),
      paymentDetails['seller_sign'], paymentDetails['collection_id'])
    
    if($('#is_collection_lazy_minted').val()=="true"){
      MintAndBuyAsset(paymentDetails['owner_address'], toNum(paymentDetails['asset_type']), paymentDetails['asset_address'],
        paymentDetails['token_id'], toNum(paymentDetails['unit_price']), toNum($('#buy_qty').val()), toNum($("#buy-total-amt-dp").attr('buyAmt')),
        paymentDetails['pay_token_address'], toNum(paymentDetails['pay_token_decimal']),
        paymentDetails['seller_sign'], paymentDetails['collection_id'], paymentDetails['token_uri'], paymentDetails['royalty'],paymentDetails['shared'],paymentDetails['total'], paymentDetails['trade_address'])
    }else{
      buyAsset(paymentDetails['owner_address'], toNum(paymentDetails['asset_type']), paymentDetails['asset_address'],
        paymentDetails['token_id'], toNum(paymentDetails['unit_price']), toNum($('#buy_qty').val()), toNum($("#buy-total-amt-dp").attr('buyAmt')),
        paymentDetails['pay_token_address'], toNum(paymentDetails['pay_token_decimal']),
        paymentDetails['seller_sign'], paymentDetails['collection_id'])
    }
  }

  window.buyPurchaseSuccess = function buyPurchaseSuccess(collectionId) {
    $('.convertDone').removeClass('hide')
    $('.approvebuyDone').removeClass('hide')
    $('.purchaseProgress').addClass('hide')
    $('.purchaseMintAndProgress').addClass('hide')
    $('.purchaseDone').removeClass('hide')
    $('.purchaseAndMintDone').removeClass('hide')
    toastr.success('Purchase succces.')
    window.location.href = '/collections/' + collectionId
  }

  window.buyPurchaseFailed = function buyPurchaseFailed(errorMsg) {
    toastr.error(errorMsg)
    hideAll()
    $('.convertDone').removeClass('hide')
    $('.approvebuyDone').removeClass('hide')
    $('.purchaseRetry').removeClass('hide')
  }


  window.buyMintAndPurchaseFailed = function buyMintAndPurchaseFailed(errorMsg) {
    toastr.error(errorMsg)
    hideAll()
    $('.convertDone').removeClass('hide')
    $('.approvebuyDone').removeClass('hide')
    $('.purchaseRetry').removeClass('hide')
  }
  $(document).on("click", ".purchaseRetry", function () {
    var contractAddress = $('#buyContractAddress').text()
    initPurchaseProcess(contractAddress)
  })


  $(document).on("click", ".execButton", function (e) {
    clearToastr();
    $('.bidExecDetail').text($(this).attr('bidDetail'))
    $('#bidByUser').text($(this).attr('bidUser'))
    $('.executeBidSymbol').text($(this).attr('bidSymbol'))
    $('#contractAddress').text($(this).attr('contractAddress'))
    $('#erc20ContractAddress').text($(this).attr('erc20ContractAddress'))
    $('#bidId').val($(this).attr('bidId'))
    calculateBidExec($(this))
    // $("#bidDetail").modal("show")
    show_modal('#bidDetail')
  })

  // EXECUTING BID MODEL HERE
  $(document).on("click", ".triggerExecuteBidValidation", function (e) {
    clearToastr();
    e.preventDefault();
    // $("#bidDetail").modal("hide")
    // $("#executeBid").modal("show");
    show_modal('#executeBid')
    initApproveExecBidProcess();
  })
 
  window.initApproveExecBidProcess = function initApproveExecBidProcess() {
    var contractType = $('#contractType').text()
    var contractAddress = $('#contractAddress').text()
    approveNFT(contractType, contractAddress, gon.collection_data['contract_shared'], 'executeBid')
  }

  window.approveBidSuccess = function approveBidSuccess() {
    hideAll()
    $('.approveExecbidDone').removeClass('hide')
    $('.acceptBidProgress').removeClass('hide')
    initAcceptBidProcess()
  }

  window.approveBidFailed = function approveBidFailed(errorMsg) {
    toastr.error(errorMsg)
    hideAll()
    $('.approveExecbidRetry').removeClass('hide')
    $('.approveBidStart').removeClass('hide')
  }

  window.swapFailed = function swapFailed(errorMsg){
    hideAll()
    $('.approveSwapRetry').removeClass('hide')
    toastr.error(errorMsg)
  }

  window.swapSuccess = function swapSuccess(collectionId){
    toastr.success('Swap Successful.')
    window.location.href = '/collections/' + collectionId
  }

  $(document).on("click", ".approveExecBidRetry", function () {
    initApproveExecBidProcess()
  })

  window.initAcceptBidProcess = function initAcceptBidProcess() {
    var contractAddress = $('#erc20ContractAddress').text();
    var paymentDetails = fetchCollectionDetails($('#bidId').val(), contractAddress);
    console.log(paymentDetails['buyer_address'], toNum(paymentDetails['asset_type']), paymentDetails['asset_address'],
      paymentDetails['token_id'], toNum(paymentDetails['amount']), toNum(paymentDetails['quantity']),
      paymentDetails['pay_token_address'], toNum(paymentDetails['pay_token_decimal']),
      paymentDetails['buyer_sign'], paymentDetails['collection_id'])

    var lazyMint = $('#is_collection_lazy_minted').val()
    if(lazyMint=="true")
    {
      $('.MintAndacceptBidProgress').removeClass('hide')
      MintAndAcceptBid(paymentDetails['buyer_address'], toNum(paymentDetails['asset_type']), paymentDetails['asset_address'],
      paymentDetails['token_id'], toNum(paymentDetails['amount_with_fee']), toNum(paymentDetails['quantity']),
      paymentDetails['pay_token_address'], toNum(paymentDetails['pay_token_decimal']),
      paymentDetails['buyer_sign'], paymentDetails['collection_id'], paymentDetails['bid_id'],paymentDetails['token_uri'],paymentDetails['royalty'],paymentDetails['shared'],paymentDetails['total'], paymentDetails['trade_address'])
    }else{
      executeBid(paymentDetails['buyer_address'], toNum(paymentDetails['asset_type']), paymentDetails['asset_address'],
        paymentDetails['token_id'], toNum(paymentDetails['amount_with_fee']), toNum(paymentDetails['quantity']),
        paymentDetails['pay_token_address'], toNum(paymentDetails['pay_token_decimal']),
        paymentDetails['buyer_sign'], paymentDetails['collection_id'], paymentDetails['bid_id'])
    }
  }

  window.acceptBidSuccess = function acceptBidSuccess(collectionId) {
    hideAll()
    $('.allDone').removeClass('hide')
    toastr.success('Bid accept succces.')
    window.location.href = '/collections/' + collectionId
  }

  window.acceptBidFailed = function acceptBidFailed(errorMsg) {
    toastr.error(errorMsg)
    hideAll()
    $('.approveExecbidDone').removeClass('hide')
    $('.acceptBidRetry').removeClass('hide')
  }

  $(document).on("click", ".acceptBidRetry", function () {
    hideAll()
    $('.approveExecbidDone').removeClass('hide')
    $('.acceptBidProgress').removeClass('hide')
    initAcceptBidProcess()
  })


  // BUYING MODEL STARTS HERE
  $(document).on("click", ".triggerBurn", function (e) {
    clearToastr();
    e.preventDefault()
    // $("#burnModal").modal("hide");
    // $("#burnToken").modal("show");
    let paymentDetails = fetchCollectionDetails()
    let quantity = parseInt($('.burnTokens').val())

    if ($('.burnTokens').length && !validNum($('.burnTokens').val())) {
      return toastr.error('Please enter valid quantity')
    } else if (quantity > paymentDetails['owned_tokens']) {
      return toastr.error("Please try again! Can't burn more than owned tokens.")
    } else {
      show_modal('#burnToken');
      initBurnProcess();
    }
  })

  window.initBurnProcess = function initBurnProcess() {
    var paymentDetails = fetchCollectionDetails()
    var qnty = -1
    if($('#collection_ismultiple').val() == "true")
    {
      qnty = parseInt($('.burnTokens').val())
      if(!qnty) {
        return toastr.error("Please enter token count.")
      }
      if(0 > qnty) {
        return toastr.error("Negative values not allowed")
      }
      console.log(qnty)
      if(qnty > paymentDetails['owned_tokens'] ){
        window.location.reload()
        return toastr.error("Please try again! Can't burn more than owned tokens.")
      }
    }
    qnty = qnty==-1 ?  paymentDetails['owned_tokens'] : qnty 
    console.log(paymentDetails['contract_type'], paymentDetails['asset_address'],
      paymentDetails['token_id'],qnty, paymentDetails['collection_id'], paymentDetails['shared'])
    burnNFT(paymentDetails['contract_type'], paymentDetails['asset_address'],
      paymentDetails['token_id'],qnty, paymentDetails['collection_id'], paymentDetails['shared'])
  }

  window.burnSuccess = function burnSuccess(transactionHash) {
    $('.burnProgress').addClass('hide')
    $('.burnDone').removeClass('hide')
    toastr.success('Burned successfully.')
    window.location.href = '/'
  }

  window.burnFailed = function burnFailed(errorMsg) {
    toastr.error(errorMsg)
    $('.burnProgress').addClass('hide')
    $('.burnRetry').removeClass('hide')
  }

  $(document).on("click", ".burnRetry", function () {
    initBurnProcess();
  })


  // TRANSFERRING MODEL STARTS HERE
  $(document).on("click", ".triggerTransfer", function (e) {
    clearToastr();
    e.preventDefault()
    var address = fetchTransferDetails()
    if(address == ethereum.selectedAddress) {
      return toastr.error('you cant transfer the collection to owned address')
    }
    if (address){
      show_modal('#transferToken');
      if($('#collection_ismultiple').val() == "true"){
        initTransferProcess($('.transferAddress').val(), parseInt($('.transferTokens').val()));
      }else{
      initTransferProcess($('.transferAddress').val());
      }
    }else{
      return toastr.error('Invalid user address. Please provide address of the user registered in the application')
    }
  })

  function fetchTransferDetails() {
    var resp = false
    $.ajax({
      url: '/collections/' + $('#collection_id').val() + '/fetch_transfer_user',
      type: 'GET',
      async: false,
      data: {address: $('.transferAddress').val()},
      success: function (data) {
        if (data.errors) {
          toastr.error(data['error'])
        } else {
          resp = data['address']
        }
      }
    });
    return resp;
  }

  window.initTransferProcess = function initTransferProcess(recipientAddress, token = 1) {
    var paymentDetails = fetchCollectionDetails()
    console.log(paymentDetails['contract_type'], paymentDetails['asset_address'], recipientAddress,
      paymentDetails['token_id'], paymentDetails['owned_tokens'], paymentDetails['collection_id'])
    console.log(gon.collection_data['contract_shared'])
    if($('#collection_ismultiple').val()=="true"){
      if(token >  paymentDetails['owned_tokens']){
        toastr.error("Please try again! Cant transfer more than owned.")
        window.location.reload()
      }
      else{
        console.log(token);
        directTransferNFT(paymentDetails['contract_type'], paymentDetails['asset_address'], recipientAddress,
      paymentDetails['token_id'], token, gon.collection_data['contract_shared'], paymentDetails['collection_id'])
      }
    }else {
    directTransferNFT(paymentDetails['contract_type'], paymentDetails['asset_address'], recipientAddress,
      paymentDetails['token_id'], paymentDetails['owned_tokens'], gon.collection_data['contract_shared'], paymentDetails['collection_id'])
    }
  }

  window.directTransferSuccess = function directTransferSuccess(transactionHash, collectionId) {
    $('.transferProgress').addClass('hide')
    $('.transferDone').removeClass('hide')
    toastr.success('Transferred successfully.')
    window.location.href = '/collections/' + collectionId
  }

  window.directTransferFailed = function directTransferFailed(errorMsg) {
    toastr.error(errorMsg)
    $('.transferProgress').addClass('hide')
    $('.transferRetry').removeClass('hide')
  }

  $(document).on("click", ".transferRetry", function () {
    initTransferProcess($('.transferAddress').val());
  })


  // PRICECHANGE MODEL STARTS HERE

  $(document).on("click", ".triggerPriceChange", function (e) {
    e.preventDefault()
    initApproveResale()
  })

  window.initApproveResale = function initApproveResale() {
    if ($('#collection-put-on-sale').is(":checked") || ($('#collection_instant_sale_enabled').is(":checked"))) {
      if ($('#collection_instant_sale_enabled').is(":checked")) {
        if (!validFloat($("#instant-price").val())) {
          return toastr.error('Please enter valid instant price')
        }else if ($('#collection_put_on_sale').is(":checked") && (!validFloat($("#minimum_bid").val()))) {
          return toastr.error('Please enter minimum bid')
        } else if ($('#collection_timed_auction_enabled').is(":checked") && (!validFloat($("#collection_bid_time").val()))) {
          return toastr.error('Please enter bid time')
        } else if ($('#instant-price').val() !== $('#instant-price').attr('prevVal')) {
          $('.signFixedPrice').removeClass('hide')
        }
      }

      const minBidVal = ($('#collection_timed_auction_enabled').is(":checked") &&
        $('#collection_instant_sale_enabled').is(":checked")) &&
        $("#collection_minimum_bid").val() > $("#instant-price").val()

      if(minBidVal) {
        return toastr.error('Minimum bid cant be more than instant selling price')
      }

      if($('#collection-put-on-sale').is(":checked") && $('#collection_ismultiple').val() == "true") {
        const copies = $('#no_of_copies').val()
        if(copies <= 0) {
          return toastr.error('Please enter valid token numbers')
        }
        const max = Number($('#no_of_copies').attr('max'));
        if(max < copies) {
          return toastr.error('Please enter number of copies less than or equal to ' + max)
        }
      }

      if ($('#instant-price').val() && $('#min-bid-price').val() && $('#instant-price').val() < $('#min-bid-price').val()) {
        return toastr.error('Instant sale price should be more than minimum bid price')
      }

      if($('#collection-put-on-sale').is(":checked") && ($('#collection-clear-delivery-details')[0] && !$('#collection-clear-delivery-details').is(":checked"))){
        return toastr.error('Please clear unlockable content before moving to put on sale')
      }

      $.magnificPopup.close();
      $.magnificPopup.open({
        closeOnBgClick: false ,
		    enableEscapeKey: false,
        items: {
          src: '#priceChange'
        },
        type: 'inline'
      });
      if ($('#collection-put-on-sale').is(":checked")) {
        $('.approveRetry').addClass('hide')
        $('.approveProgress').removeClass('hide')
        var details = fetchCollectionDetails()
        approveResaleNFT(details['contract_type'], details['asset_address'], details['shared'])
      } else {
        hideAll()
        $('.approveFlow').addClass('hide')
        initsignFixedPriceUpdate()
      }
    } else {
      $("#submitPriceChange").click()
    }
  }

  window.approveResaleSuccess = function approveResaleSuccess() {
    hideAll()
    $('.approveDone').removeClass('hide')
    if ($('#collection_instant_sale_enabled').is(":checked")) {
      initsignFixedPriceUpdate()
    } else {
      $("#submitPriceChange").click()
    }
  }

  window.approveResaleFailed = function approveResaleFailed(errorMsg) {
    toastr.error(errorMsg)
    $('.approveProgress').addClass('hide')
    $('.approveRetry').removeClass('hide')
  }

  window.initsignFixedPriceUpdate = function initsignFixedPriceUpdate() {
    hideAll()
    $('.approveDone').removeClass('hide')
    $('.signFixedPrice').removeClass('hide')
    $('.signFixPriceRetry').addClass('hide')
    $('.signFixPriceProgress').removeClass('hide')
    var pay_token_address = $('#collection_erc20_token_id option:selected, this').attr('address')
    var pay_token_decimal = $('#collection_erc20_token_id option:selected, this').attr('decimals')
    var details = fetchCollectionDetails(null, pay_token_address)
    if (details) {
      signSellOrder($('#instant-price').val(), pay_token_decimal, pay_token_address,
        details['token_id'], details['asset_address'], details['collection_id'], 'update')
    } else {
      bidSignFixedFailed('Unable to fetch tokan details. Please try again later')
    }
  }

  window.updateSignFixedSuccess = function updateSignFixedSuccess(collectionId) {
    $("#submitPriceChange").click()
  }

  window.updateSignFixedFailed = function updateSignFailed(errorMsg) {
    toastr.error(errorMsg)
    hideAll()
    $('.approveDone').removeClass('hide')
    $('.signFixPriceRetry').removeClass('hide')
  }

  // COMMON METHODS FOR BIDDING MODEL
  function hideAll() {
    $('.allProgress').addClass('hide')
    $('.allDone').addClass('hide')
    $('.allRetry').addClass('hide')
    $('.allStart').addClass('hide')
  }

  $('#createOwnErc721, #deployContract, #collectionStepModal').on('hidden.bs.modal', function () {
    $("#collectionCreateForm :input").prop("disabled", false);
  })

  $('#placeBid').on('hidden.bs.modal', function () {
    $("#biddingForm :input").prop("disabled", false);
    $(".bid-now").trigger("click");
    // $("#Bid-modal").modal("show")
    // $.magnificPopup.close();
    $.magnificPopup.open({
      closeOnBgClick: false ,
		  enableEscapeKey: false,
      items: {
        src: '#Bid-modal'
      },
      type: 'inline'
    });
  })

  $('#placeBuy').on('hidden.bs.modal', function () {
    $("#buyForm :input").prop("disabled", false);
    // $("#Buy-modal").modal("show")
    // $.magnificPopup.close();
    $.magnificPopup.open({
      closeOnBgClick: false ,
		  enableEscapeKey: false,
      items: {
        src: '#Buy-modal'
      },
      type: 'inline'
    });
  })

  $('#swapRequest').on('hidden.bs.modal', function () {
    $("#biddingForm :input").prop("disabled", false);
    $(".bid-now").trigger("click");
    // $("#Bid-modal").modal("show")
    // $.magnificPopup.close();
    $.magnificPopup.open({
      closeOnBgClick: false ,
      enableEscapeKey: false,
      items: {
        src: '#Swap-modal'
      },
      type: 'inline'
    });
  })

  function convertCoinToToken(totalAmt, callBackType = 'Bid') {
    $('.allRetry').addClass('hide')
    $('.convertProgress').removeClass('hide')
    // $("#" + callBackType + "-modal").modal("hide")
    // $("#place" + callBackType).modal("show")
    $.magnificPopup.close();
    $.magnificPopup.open({
      closeOnBgClick: false ,
		  enableEscapeKey: false,
      items: {
        src: "#place" + callBackType
      },
      type: 'inline'
    });
    convertToken(totalAmt, callBackType)
  }

  $(document).on("click", ".convertRetry", function () {
    if ($("#bid-total-amt-dp").attr('bidAmt') === undefined) {
      convertCoinToToken($("#buy-total-amt-dp").attr('buyAmt'), 'Buy')
    } else {
      convertCoinToToken($("#bid-total-amt-dp").attr('bidAmt'), 'Bid')
    }
  })

  $(document).on("click", ".buy-now", function () {
    console.log($('#buyContractAddress').text())
    loadTokenBalance($('#buyContractAddress').text(), $('#buyContractDecimals').text());
  })

  $(document).on("click", ".bid-now", function () {
    var sym = $('#bid_currency :selected').text();
    var contractAddress = $('#bid_currency :selected').attr('address');
    var decimals = $('#bid_currency :selected').attr('decimals');
    loadTokenBalance(contractAddress, decimals, sym);
  })

  window.loadTokenBalance = async function loadTokenBalance(contractAddress, decimals, symbol) {
    var assetBalance = await tokenBalance(contractAddress, decimals);
    $('.ercCurBalance').text(assetBalance);
    $('#erc20_balance').text(assetBalance)
    $("#biding-asset-balance").text(mergeAmountSymbol(assetBalance, symbol));
  }

  function fetchCollectionDetails(bidId, erc20Address) {
    var resp = false
    var erc20Address;
    $.ajax({
      url: '/collections/' + $('#collection_id').val() + '/fetch_details',
      type: 'GET',
      async: false,
      data: {bid_id: bidId, erc20_address: erc20Address},
      success: function (respVal) {
        resp = respVal['data']
      }
    });
    return resp;
  }

  function fetchSwapDetails(swapId) {
    var resp = false
    $.ajax({
      url: '/collections/' + $('#collection_id').val() + '/fetch_swap_details',
      type: 'GET',
      async: false,
      data: {swap_id: swapId},
      success: function (respVal) {
        resp = respVal['data']
      }
    });
    return resp;
  }

  window.calculateBid = async function calculateBid(feePercentage) {
    var sym = $('#bid_currency :selected').text();
    var contractAddress = $('#bid_currency :selected').attr('address');
    var decimals = $('#bid_currency :selected').attr('decimals');
    if ($('#bid_qty').val()) {
      var qty = $('#bid_qty').val() || 0;
    } else {
      var qty = 1;
    }
    var price = $('#bid_amt').val() || 0;
    var payAmt = multipliedBy(price, qty)
    var serviceFee = percentageOf(feePercentage, payAmt);
    var totalAmt = plusNum(payAmt, serviceFee);
    $("#bid-amt-dp").html(mergeAmountSymbol(serviceFee, sym))
    $("#bid-total-amt-dp").html(mergeAmountSymbol(totalAmt, sym));
    var biddingAssetBalance = await tokenBalance(contractAddress, decimals) || 0;
    $('#erc20_balance').text(biddingAssetBalance);
    $("#biding-asset-balance").text(mergeAmountSymbol(biddingAssetBalance, sym));
    $("#bid-total-amt-dp").attr('bidAmt', totalAmt);
    $("#bid-total-amt-dp").attr('bidPayAmt', payAmt);
  }

  window.calculateBuy = function calculateBuy(feePercentage) {
    var price = $('#buy_price').attr('price');
    var qty = $('#buy_qty').val() || 0;
    var payAmt = multipliedBy(price, qty)
    var serviceFee = percentageOf(feePercentage, payAmt);
    var totalAmt = plusNum(payAmt, serviceFee);
    $("#buy-amt-dp").html(numToString(serviceFee))
    $("#buy-total-amt-dp").html(numToString(totalAmt));
    $("#buy-total-amt-dp").attr('buyAmt', numToString(totalAmt));
  }

  window.calculateBidExec = function calculateBuy(thisBid) {
    var payAmt = thisBid.attr('price');
    var qty = thisBid.attr('qty');
    var serviceFee = $('#serviceFee').text()
    var serviceFee = percentageOf(serviceFee, payAmt);
    var totalAmt = minusNum(payAmt, serviceFee);
    $("#execServiceFee").html(numToString(serviceFee));
    if ($('#royaltyFee').attr('royaltyPercentage')) {
      var royaltyFeePer = $('#royaltyFee').attr('royaltyPercentage')
      var royaltyFee = percentageOf(royaltyFeePer, payAmt)
      $("#executeBidRoyaltyFee").html(royaltyFee);
      var totalAmt = minusNum(totalAmt, royaltyFee);
    }
    $("#executeBidFinalAmt").html(numToString(totalAmt));
  }

  $(document).on("click", ".change-price", function () {
    $(".change-price-modal-title").text($(this).text())
  })

  // Collection - Detail page buy and Place bid button action
  $(document).on("click", ".show-login-message", function (e) {
    toastr.error('Pending for admin approval.')
    e.preventDefault();
  });
  $(document).on("click", ".connect-to-wallet", function (e) {
    toastr.error('Please connect your wallet to proceed.')
    e.preventDefault();
  });

  $(document).on("change", ".ercSelection", function() {
    $(".lazyMinting").prop("disabled", false);
  })

  $(document).on("change", ".ownNft", function() {
    $(".lazyMinting").prop("disabled", true);
    $(".instantMint").prop("checked", true);
  })

  $(document).on("click", ".cancelCreate", function() {
    $("#collectionCreateForm :input").prop("disabled", false);
  });
  $(document).on('click', '.chooseCollectionType', function (e) {
    if($(this).val() == 'create') {
      $('#lazy_minting').hide()
      $('#chooseMintType_mint').prop('checked', true)
    }else {
      $('#lazy_minting').show()
    }
  });
})
