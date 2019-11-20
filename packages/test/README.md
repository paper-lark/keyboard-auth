# Test stand

Test stand is used to assess authentication algorithms on a user dataset.

## How to run?

In order to assess the algorithm some parameters of the dataset should be specified:
- DATA_PATH – path to the root of the dataset
- FEATURES_FILENAME – file containing raw features collected during user session.

Example:

```bash
env DATA_PATH=<path_to_dataset>
    FEATURES_FILENAME=<file_with_features>
    yarn run start
```