set -x
rm -rf build
mkdir build
cd build
cmake ..
make -j8
./unit_test
lcov --directory . --capture --output-file ./lcov_all.info -rc lcov_branch_coverage=1

# 找出所有test测试代码
cd ..
all_test_files=$PWD

# 找出所有third_party第三方库的代码
cd ../third_party
all_third_party_files=$PWD

cd ../test/build
lcov --remove lcov_all.info '/usr/local/include/*' '/Applications/*' \
$all_test_files'/*' $all_third_party_files'/*' -o  lcov.info
genhtml lcov.info --branch-coverage --output-directory ./code_coverage_report/
