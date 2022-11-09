// require ("packs/ethereum/web3.js")

$(document).on('click', '#fee_submit', function () {
  $("form#fee_form").submit();
  console.log($('select#fee_type').val());
//   $("div.loading-gif.displayInMiddle").show();
//   if($('select#fee_type').val() === 'Buyer'){
//     updateBuyerServiceFee($('input#fee_per_mile').val())
//   }
//   else if($('select#fee_type').val() === 'Seller'){
//     updateSellerServiceFee($('input#fee_per_mile').val())
//   }
//   else if($('select#fee_type').val() === 'Platform'){
//     $("form#fee_form").submit();
//     $("div.loading-gif.displayInMiddle").hide();
//   }
//   else{
//     toastr.error('Please select the fee type.');
//     $("div.loading-gif.displayInMiddle").hide();
//   }
});
