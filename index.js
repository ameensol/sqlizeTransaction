var async = require('async')
var fs = require('fs')


var db = require('./sqlize')(function (err, db) {
  if (err) throw err
  var Sequelize = db.Sequelize
  var sequelize = db.sequelize
  var Tweeter = db.Tweeter

  // files contain array of twitter account objects -- members of the list
  var files = ['list1.json', 'list2.json']

  async.waterfall([
    // First, load both files into memory
    function readMembers(done) {
      async.map(files, function (file, fin) {
        fs.readFile(file, function (err, membersJSON) {
          if (err) return fin(err)
          var members = JSON.parse(membersJSON)
          return fin(null, members)
        })
      },
      function (err, listMembers) {
        if (err) return done(err)
        if (!listMembers || !listMembers.length || !listMembers.length === 2) {
          return done(null, new Error('listMembers malformed'))
        }
        var membersCount = listMembers[0].length + listMembers[1].length
        console.log('There are a total of ' + membersCount + ' list members to save.')
        return done(null, listMembers) })
    },
    function saveMembers(listMembers, done) {

      var transaction = function (count, members) {
        return sequelize.transaction(function (t) {
          console.log('Started transaction for list' + count)
          return sequelize.Promise.map(members, function (member) {
            return Tweeter.findOrCreate({where: {id: member.id}, defaults: member}, {transaction: t})
          })
        })
      }

      var noTransaction = function (count, members) {
        console.log('Started noTransaction for list' + count)
        return sequelize.Promise.map(members, function (member) {
          return Tweeter.findOrCreate({where: {id: member.id}, defaults: member})
        })
      }

      // listMembers is a length 2 array of the arrays of list members
      var listCount = 0
      async.each(listMembers, function (members, fin) {
        listCount ++
        var count = listCount
        var start = new Date().getTime()
        noTransaction(count, members).then(function () {
          var finish = new Date().getTime()
          var elapsed = (finish - start) / 1000
          console.log(elapsed + 's: Finished saving members of list' + count + '.')
          return fin(null)
        }, function (err) {
          var finish = new Date().getTime()
          var elapsed = (finish - start) / 1000
          console.log(elapsed + 's: There was an error while trying to save the data.')
          return fin(err)
        })
      },
      function (err) {
        if (err) return done(err)
        return done(null)
      })
    }
  ],
  function (err) {
    if (err) {
      console.log(err)
      throw err
    }
    console.log('Finished saving both list members.')
    Tweeter.findAndCountAll().then(function (result) {
      console.log('There are ' + result.count + ' saved members.')
    }, function (err) {
      console.log('Error counting saved members.')
      throw err
    })
  })
})
