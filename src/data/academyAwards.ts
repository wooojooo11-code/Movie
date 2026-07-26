export type AcademyAwardCategory = 'bestPicture' | 'bestDirector' | 'actingWinner';

/**
 * Award matches for the local catalog as of 2026-07-26.
 *
 * The Academy Awards Database supplies the winner records. Director and cast
 * credits are then matched against the catalog's TMDB records. "actingWinner"
 * covers winners of Actor, Actress, Supporting Actor, and Supporting Actress.
 */
export const academyAwardMovieIds: Record<AcademyAwardCategory, readonly string[]> = {
  bestPicture: [
    'movie_6', 'movie_39', 'movie_48', 'movie_58', 'movie_65', 'movie_89', 'movie_101', 'movie_165',
    'movie_267', 'movie_321', 'movie_412', 'movie_477', 'movie_512', 'movie_543', 'movie_596', 'movie_597',
    'movie_645', 'movie_681'
  ],
  bestDirector: [
    'movie_3', 'movie_5', 'movie_6', 'movie_9', 'movie_18', 'movie_33', 'movie_34', 'movie_39', 'movie_41',
    'movie_45', 'movie_48', 'movie_56', 'movie_57', 'movie_58', 'movie_67', 'movie_71', 'movie_72', 'movie_79',
    'movie_82', 'movie_83', 'movie_85', 'movie_87', 'movie_89', 'movie_97', 'movie_101', 'movie_104', 'movie_130',
    'movie_131', 'movie_cinephile_523', 'movie_138', 'movie_165', 'movie_168', 'movie_200', 'movie_202',
    'movie_214', 'movie_224', 'movie_242', 'movie_246', 'movie_248', 'movie_267', 'movie_288', 'movie_299',
    'movie_321', 'movie_346', 'movie_362', 'movie_377', 'movie_378', 'movie_380', 'movie_400', 'movie_452',
    'movie_456', 'movie_458', 'movie_477', 'movie_497', 'movie_512', 'movie_524', 'movie_525', 'movie_538',
    'movie_558', 'movie_564', 'movie_573', 'movie_588', 'movie_596', 'movie_597', 'movie_612', 'movie_617',
    'movie_642', 'movie_645', 'movie_657', 'movie_671', 'movie_674', 'movie_681', 'movie_686', 'movie_703',
    'movie_718'
  ],
  actingWinner: [
    'movie_1', 'movie_2', 'movie_3', 'movie_4', 'movie_5', 'movie_9', 'movie_12', 'movie_13', 'movie_14',
    'movie_16', 'movie_19', 'movie_21', 'movie_23', 'movie_24', 'movie_25', 'movie_28', 'movie_29', 'movie_31',
    'movie_33', 'movie_34', 'movie_36', 'movie_37', 'movie_38', 'movie_39', 'movie_40', 'movie_41', 'movie_48',
    'movie_50', 'movie_51', 'movie_55', 'movie_56', 'movie_57', 'movie_58', 'movie_59', 'movie_62', 'movie_63',
    'movie_64', 'movie_65', 'movie_66', 'movie_67', 'movie_73', 'movie_77', 'movie_79', 'movie_81', 'movie_82',
    'movie_84', 'movie_85', 'movie_86', 'movie_87', 'movie_88', 'movie_89', 'movie_93', 'movie_94', 'movie_95',
    'movie_96', 'movie_97', 'movie_98', 'movie_99', 'movie_100', 'movie_101', 'movie_104', 'movie_105', 'movie_112',
    'movie_113', 'movie_117', 'movie_118', 'movie_123', 'movie_124', 'movie_127', 'movie_129', 'movie_131',
    'movie_132', 'movie_133', 'movie_cinephile_513', 'movie_cinephile_514', 'movie_cinephile_515',
    'movie_cinephile_516', 'movie_cinephile_517', 'movie_cinephile_519', 'movie_cinephile_520',
    'movie_cinephile_518', 'movie_cinephile_521', 'movie_135', 'movie_cinephile_522', 'movie_cinephile_523',
    'movie_137', 'movie_138', 'movie_139', 'movie_140', 'movie_144', 'movie_145', 'movie_154', 'movie_155',
    'movie_156', 'movie_157', 'movie_158', 'movie_163', 'movie_165', 'movie_168', 'movie_169', 'movie_170',
    'movie_171', 'movie_174', 'movie_176', 'movie_177', 'movie_180', 'movie_181', 'movie_182', 'movie_183',
    'movie_184', 'movie_186', 'movie_187', 'movie_188', 'movie_190', 'movie_192', 'movie_198', 'movie_201',
    'movie_202', 'movie_203', 'movie_204', 'movie_206', 'movie_209', 'movie_211', 'movie_212', 'movie_216',
    'movie_224', 'movie_226', 'movie_229', 'movie_230', 'movie_232', 'movie_234', 'movie_235', 'movie_236',
    'movie_237', 'movie_238', 'movie_239', 'movie_240', 'movie_242', 'movie_243', 'movie_245', 'movie_246',
    'movie_247', 'movie_248', 'movie_250', 'movie_252', 'movie_253', 'movie_254', 'movie_258', 'movie_259',
    'movie_260', 'movie_264', 'movie_267', 'movie_269', 'movie_270', 'movie_273', 'movie_274', 'movie_276',
    'movie_278', 'movie_280', 'movie_282', 'movie_283', 'movie_284', 'movie_285', 'movie_290', 'movie_291',
    'movie_292', 'movie_293', 'movie_294', 'movie_295', 'movie_296', 'movie_297', 'movie_299', 'movie_300',
    'movie_301', 'movie_302', 'movie_303', 'movie_307', 'movie_316', 'movie_319', 'movie_320', 'movie_321',
    'movie_322', 'movie_324', 'movie_325', 'movie_326', 'movie_327', 'movie_335', 'movie_338', 'movie_339',
    'movie_340', 'movie_341', 'movie_342', 'movie_344', 'movie_347', 'movie_351', 'movie_352', 'movie_353',
    'movie_354', 'movie_355', 'movie_358', 'movie_362', 'movie_364', 'movie_368', 'movie_370', 'movie_371',
    'movie_372', 'movie_374', 'movie_375', 'movie_380', 'movie_382', 'movie_384', 'movie_386', 'movie_390',
    'movie_391', 'movie_392', 'movie_393', 'movie_394', 'movie_396', 'movie_397', 'movie_398', 'movie_400',
    'movie_401', 'movie_402', 'movie_403', 'movie_404', 'movie_405', 'movie_407', 'movie_408', 'movie_410',
    'movie_412', 'movie_415', 'movie_417', 'movie_418', 'movie_419', 'movie_421', 'movie_422', 'movie_426',
    'movie_427', 'movie_428', 'movie_432', 'movie_436', 'movie_438', 'movie_442', 'movie_444', 'movie_445',
    'movie_446', 'movie_450', 'movie_452', 'movie_454', 'movie_455', 'movie_456', 'movie_461', 'movie_463',
    'movie_465', 'movie_470', 'movie_477', 'movie_480', 'movie_482', 'movie_484', 'movie_486', 'movie_487',
    'movie_488', 'movie_490', 'movie_492', 'movie_495', 'movie_497', 'movie_501', 'movie_502', 'movie_507',
    'movie_510', 'movie_512', 'movie_513', 'movie_516', 'movie_519', 'movie_520', 'movie_521', 'movie_522',
    'movie_530', 'movie_532', 'movie_534', 'movie_537', 'movie_538', 'movie_540', 'movie_542', 'movie_543',
    'movie_544', 'movie_546', 'movie_547', 'movie_551', 'movie_552', 'movie_554', 'movie_556', 'movie_558',
    'movie_559', 'movie_562', 'movie_563', 'movie_564', 'movie_566', 'movie_567', 'movie_568', 'movie_570',
    'movie_572', 'movie_579', 'movie_580', 'movie_582', 'movie_584', 'movie_586', 'movie_587', 'movie_594',
    'movie_597', 'movie_598', 'movie_602', 'movie_603', 'movie_605', 'movie_612', 'movie_613', 'movie_617',
    'movie_621', 'movie_622', 'movie_624', 'movie_627', 'movie_628', 'movie_634', 'movie_636', 'movie_637',
    'movie_638', 'movie_639', 'movie_640', 'movie_641', 'movie_642', 'movie_643', 'movie_644', 'movie_645',
    'movie_648', 'movie_649', 'movie_650', 'movie_656', 'movie_657', 'movie_659', 'movie_660', 'movie_661',
    'movie_662', 'movie_665', 'movie_671', 'movie_672', 'movie_676', 'movie_677', 'movie_678', 'movie_681',
    'movie_685', 'movie_686', 'movie_688', 'movie_690', 'movie_691', 'movie_692', 'movie_693', 'movie_694',
    'movie_700', 'movie_703', 'movie_706', 'movie_708', 'movie_714', 'movie_717', 'movie_720', 'movie_722',
    'movie_723'
  ]
};

const academyAwardSets: Record<AcademyAwardCategory, ReadonlySet<string>> = {
  bestPicture: new Set(academyAwardMovieIds.bestPicture),
  bestDirector: new Set(academyAwardMovieIds.bestDirector),
  actingWinner: new Set(academyAwardMovieIds.actingWinner)
};

export const getAcademyAwardCategories = (movieId: string): AcademyAwardCategory[] =>
  (Object.keys(academyAwardMovieIds) as AcademyAwardCategory[]).filter((category) =>
    academyAwardSets[category].has(movieId)
  );
