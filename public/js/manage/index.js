(function() {
  $(function() {

    $('#export').click(function(){
      var extra = ''
      if ($('#showDownloaded').is(':checked'))
        extra = 'downloaded=1'
      var url ='/manage/api/registrations/' + $('#year option:selected').val() + '?csv=1&' + extra;
      window.location = url;
    });

    $('#showDownloaded').change(function() {
      reload();
    })

    load();

  })
  var reload = function() {
    $('#list').dataTable().fnDestroy();
    load();
  }
  
  var load = function() {

    var extra = ''
    if ($('#showDownloaded').is(':checked'))
      extra = '?downloaded=1'
    var url ='/manage/api/registrations/' + $('#year option:selected').val() + extra;

    $.getJSON(url, function(json) {
      var data = [];
      if (json.data)
        data = json.data;

      grid = $('#list').dataTable({
        bAutoWidth: false,
        sDom: '<\'row-fluid\'<\'span6\'l><\'span6\'f>r>t<\'row-fluid\'<\'span6\'i><\'span6\'p>',
        sPaginationType: 'bootstrap',
        bServerSide: false,
        bProcessing: true,
        fnDrawCallback: function() {
          return $('div.dataTables_filter input').focus();
        },
        oLanguage: {
          sEmptyTable: "No matching records found"
        },
        aoColumns: [
          {
            mData: 'contact.contact',
            sTitle: 'Contact'
          }, {
            mData: 'contact.email',
            sTitle: 'Email'
          }, {
            mData: 'contact.phone',
            sTitle: 'Phone'
          }, {
            mData: 'order.level',
            sTitle: 'Level'
          }, {
            mData: 'order.extraSeats',
            sTitle: 'Extra Seats'
          }
        ],
        aaData : data
      });  
    });
  }
}).call(this);