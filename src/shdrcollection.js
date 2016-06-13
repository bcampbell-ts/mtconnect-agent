/**
  * fns: shdrParsing, dataCollectionUpdate
  * postinsert circular buffer insertion and pointer updation
  */
const lokijs = require('./lokijs');
const LRUMap = require('collections/lru-map');

const buffersize = 10; // TODO: change it to the required buffer size
let sequenceid = 0; // TODO: sequenceid should be updated

/**
  * creates a database to store shdr value
  */
const shdr = lokijs.getshdrDB();
const shdrmap = new LRUMap({}, buffersize); /* circular buffer */

// TODO: insert the corresponding uuid
const uuid = 'innovaluesthailand_CINCOMA26-1_b77e26';

// TODO: corresponding id
const id = 'dtop_2';

/**
  *string parsing and storing dataitemname and value from shdr
  */
function shdrParsing(shdrstring) {
  const shdrparse = shdrstring.split('|');
  const totaldataitem = (shdrparse.length - 1) / 2;
  const shdrdata = {
    time: shdrparse[0],
    dataitem: [],
  };

  // TODO: change to map asynchronous
  for (let i = 0, j = 1; i < totaldataitem; i++, j += 2) {
    // to getrid of edge conditions eg: 2016-04-12T20:27:01.0530|logic1|NORMAL||||
    if (shdrparse[j]) {
      shdrdata.dataitem.push({ name: shdrparse[j], value: shdrparse[j + 1] });
    }
  }
  return shdrdata;
}

/**
  *updating the circular buffer, first sequence and last sequence after every insert
  */
shdr.on('insert', (obj) => {
  let keyarray = shdrmap.keys();
  if (keyarray.length === 0) {
    shdrmap.add({ dataitemname: obj.dataitemname, uuid: obj.uuid, id: obj.id,
    value: obj.value }, obj.sequenceid);
    keyarray = shdrmap.keys();
  } else if ((keyarray[0]) && (keyarray[buffersize - 1] === undefined)) {
    shdrmap.add({ dataitemname: obj.dataitemname, uuid: obj.uuid,
    id: obj.id, value: obj.value }, obj.sequenceid);
    keyarray = shdrmap.keys();
  } else {
    keyarray = shdrmap.keys();
    shdrmap.add({ dataitemname: obj.dataitemname, uuid: obj.uuid, id: obj.id,
    value: obj.value }, obj.sequenceid);
    keyarray = shdrmap.keys();
  }
});

/**
  *inserting shdr data into data collection
  */
function dataCollectionUpdate(shdrarg) {
  const dataitemno = shdrarg.dataitem.length;

  for (let i = 0; i < dataitemno; i++) {
    shdr.insert({ sequenceid: sequenceid++, id, uuid, time: shdrarg.time,
                  dataitemname: shdrarg.dataitem[i].name, value: shdrarg.dataitem[i].value });
  }
  return shdrmap;
}

module.exports = {
  shdrParsing,
  dataCollectionUpdate,
  shdrmap,
};
